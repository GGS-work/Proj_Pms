const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function fixUsersTable() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('📦 Connecting to database...');
  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('🔧 Adding missing columns to users table...\n');

    const columns = [
      { name: 'date_of_birth', type: 'date', description: 'Date of birth' },
      { name: 'native', type: 'text', description: 'Native place' },
      { name: 'mobile_no', type: 'text', description: 'Mobile number' },
      { name: 'designation', type: 'text', description: 'Job designation' },
      { name: 'department', type: 'text', description: 'Department' },
      { name: 'experience', type: 'integer', description: 'Years of experience' },
      { name: 'date_of_joining', type: 'date', description: 'Date of joining' },
      { name: 'skills', type: 'text[]', description: 'Skills array' }
    ];

    for (const column of columns) {
      try {
        await sql.unsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}`);
        console.log(`✓ Added column: ${column.name} (${column.description})`);
      } catch (error) {
        if (error.code === '42701' || error.message.includes('already exists')) {
          console.log(`⊘ Column ${column.name} already exists`);
        } else {
          throw error;
        }
      }
    }

    // Also add project_id to members table if missing
    try {
      await sql.unsafe(`ALTER TABLE members ADD COLUMN IF NOT EXISTS project_id uuid`);
      console.log('✓ Added column: project_id to members table');
    } catch (error) {
      if (error.code === '42701' || error.message.includes('already exists')) {
        console.log('⊘ Column project_id in members already exists');
      }
    }

    console.log('\n✅ Users table updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
  
  await sql.end();
}

fixUsersTable().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
