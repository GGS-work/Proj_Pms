const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function fixAllSchemaIssues() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('📦 Connecting to database...');
  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('🔧 Fixing all schema issues...\n');

    // Fix 1: Rename attendance columns to match schema expectations
    console.log('1️⃣  Fixing attendance table...');
    
    // Check if attendance exists with old column names
    const attendanceCheck = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'attendance' AND column_name IN ('check_in', 'shift_start_time')
    `;
    
    if (attendanceCheck.some(c => c.column_name === 'check_in')) {
      console.log('   Renaming columns in attendance table...');
      await sql`ALTER TABLE attendance RENAME COLUMN check_in TO shift_start_time`;
      await sql`ALTER TABLE attendance RENAME COLUMN check_out TO shift_end_time`;
      await sql`ALTER TABLE attendance RENAME COLUMN total_hours TO total_duration`;
      await sql`ALTER TABLE attendance RENAME COLUMN notes TO end_activity`;
      await sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS daily_tasks text`;
      console.log('   ✓ Attendance table fixed');
    } else {
      console.log('   ✓ Attendance table already correct');
    }

    // Fix 2: Add missing columns to notifications
    console.log('\n2️⃣  Fixing notifications table...');
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_by uuid REFERENCES users(id)`;
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_by_name text`;
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false`;
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at timestamp`;
    // Rename read column if it exists
    const notifColumns = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'read'
    `;
    if (notifColumns.length > 0) {
      await sql`ALTER TABLE notifications DROP COLUMN read`;
    }
    console.log('   ✓ Notifications table fixed');

    // Fix 3: Add missing columns to projects
    console.log('\n3️⃣  Fixing projects table...');
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS post_date timestamp`;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS tentative_end_date timestamp`;
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS assignees jsonb DEFAULT '[]'`;
    console.log('   ✓ Projects table fixed');

    // Fix 4: Add missing columns to custom_bug_types
    console.log('\n4️⃣  Fixing custom_bug_types table...');
    await sql`ALTER TABLE custom_bug_types ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now()`;
    await sql`ALTER TABLE custom_bug_types ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()`;
    console.log('   ✓ Custom bug types table fixed');

    // Fix 5: Rename columns in project_requirements if needed
    console.log('\n5️⃣  Fixing project_requirements table...');
    const reqColumns = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'project_requirements'
    `;
    
    // Add project_manager_id if missing
    if (!reqColumns.some(c => c.column_name === 'project_manager_id')) {
      await sql`ALTER TABLE project_requirements ADD COLUMN project_manager_id uuid REFERENCES users(id)`;
      console.log('   ✓ Added project_manager_id column');
    }
    
    // Add other missing columns
    await sql`ALTER TABLE project_requirements ADD COLUMN IF NOT EXISTS sample_input_files text`;
    await sql`ALTER TABLE project_requirements ADD COLUMN IF NOT EXISTS expected_output_files text`;
    await sql`ALTER TABLE project_requirements ADD COLUMN IF NOT EXISTS status text DEFAULT 'PENDING'`;
    console.log('   ✓ Project requirements table fixed');

    // Fix 6: Add missing columns to custom_designations
    console.log('\n6️⃣  Fixing custom_designations table...');
    await sql`ALTER TABLE custom_designations ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now()`;
    await sql`ALTER TABLE custom_designations ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()`;
    console.log('   ✓ Custom designations table fixed');

    // Fix 7: Add missing columns to custom_departments
    console.log('\n7️⃣  Fixing custom_departments table...');
    await sql`ALTER TABLE custom_departments ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now()`;
    await sql`ALTER TABLE custom_departments ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now()`;
    console.log('   ✓ Custom departments table fixed');

    console.log('\n✅ All schema issues fixed!');
    console.log('\n📋 Summary:');
    console.log('   - Attendance table: columns renamed');
    console.log('   - Notifications: action_by, action_by_name, is_read, read_at added');
    console.log('   - Projects: post_date, tentative_end_date, assignees added');
    console.log('   - Custom bug types: timestamps added');
    console.log('   - Project requirements: project_manager_id and other columns added');
    console.log('   - Custom tables: timestamps added');
    console.log('\n🔄 Please restart your dev server now!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  await sql.end();
}

fixAllSchemaIssues().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
