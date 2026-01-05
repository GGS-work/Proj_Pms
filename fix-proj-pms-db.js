const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function fixProjPmsDbSchema() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('📦 Connecting to proj_pms_db...');
  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('🔧 Fixing proj_pms_db schema to match application code...\n');

    // Fix 1: Add reporter_id and creator_id to tasks
    console.log('1️⃣  Fixing tasks table...');
    await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reporter_id uuid REFERENCES users(id)`;
    await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES users(id)`;
    console.log('   ✓ Tasks table: added reporter_id and creator_id');

    // Fix 2: Rename user_id to employee_id in task_overviews (if user_id exists)
    console.log('\n2️⃣  Fixing task_overviews table...');
    const overviewCols = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'task_overviews' AND column_name IN ('user_id', 'employee_id')
    `;
    
    if (overviewCols.some(c => c.column_name === 'user_id') && !overviewCols.some(c => c.column_name === 'employee_id')) {
      await sql`ALTER TABLE task_overviews RENAME COLUMN user_id TO employee_id`;
      console.log('   ✓ Task overviews: renamed user_id to employee_id');
    } else if (!overviewCols.some(c => c.column_name === 'employee_id')) {
      await sql`ALTER TABLE task_overviews ADD COLUMN employee_id uuid REFERENCES users(id)`;
      console.log('   ✓ Task overviews: added employee_id column');
    } else {
      console.log('   ✓ Task overviews: employee_id already exists');
    }

    // Fix 3: Create attendance table if missing
    console.log('\n3️⃣  Checking attendance table...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'attendance'
      )
    `;
    
    if (!tableExists[0].exists) {
      await sql`
        CREATE TABLE attendance (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
          project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
          shift_start_time timestamp DEFAULT now() NOT NULL,
          shift_end_time timestamp,
          total_duration integer DEFAULT 0,
          end_activity text,
          daily_tasks text,
          status text DEFAULT 'IN_PROGRESS',
          created_at timestamp DEFAULT now() NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        )
      `;
      console.log('   ✓ Attendance table created');
    } else {
      console.log('   ✓ Attendance table already exists');
      // Ensure it has the right columns
      await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS shift_start_time timestamp`;
      await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS shift_end_time timestamp`;
      await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS total_duration integer DEFAULT 0`;
      await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS end_activity text`;
      await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS daily_tasks text`;
      console.log('   ✓ Attendance columns verified');
    }

    console.log('\n✅ proj_pms_db schema fixed!');
    console.log('\n📋 Changes made:');
    console.log('   - tasks: reporter_id, creator_id added');
    console.log('   - task_overviews: employee_id column ensured');
    console.log('   - attendance: table and columns verified');
    console.log('\n🔄 Clear cache and restart dev server!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  await sql.end();
}

fixProjPmsDbSchema().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
