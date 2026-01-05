const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('📦 Connecting to database...');
  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('\n📊 Checking database tables...\n');

    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('✓ Found', tables.length, 'tables:\n');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    // Check users table structure
    console.log('\n📋 Users table columns:');
    const userColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    userColumns.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));

    // Check sessions/user_sessions table
    console.log('\n📋 Checking sessions table...');
    const sessionsExists = tables.find(t => t.table_name === 'sessions');
    const userSessionsExists = tables.find(t => t.table_name === 'user_sessions');
    
    if (sessionsExists) {
      console.log('  ✓ Found: sessions table');
      const sessionCols = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'sessions'
      `;
      console.log('    Columns:', sessionCols.map(c => c.column_name).join(', '));
    }
    
    if (userSessionsExists) {
      console.log('  ✓ Found: user_sessions table');
      const userSessionCols = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'user_sessions'
      `;
      console.log('    Columns:', userSessionCols.map(c => c.column_name).join(', '));
    }

    // Check for test users
    console.log('\n👥 Test users in database:');
    const testUsers = await sql`
      SELECT id, name, email, password IS NOT NULL as has_password
      FROM users 
      WHERE email IN ('varun@pms.com', 'karthikeyan@pms.com')
    `;
    
    if (testUsers.length > 0) {
      testUsers.forEach(u => {
        console.log(`  ✓ ${u.name} (${u.email}) - Password: ${u.has_password ? 'SET' : 'NOT SET'}`);
      });
    } else {
      console.log('  ⚠ No test users found!');
    }

    // Check workspace and members
    console.log('\n🏢 Workspaces:');
    const workspaces = await sql`SELECT id, name FROM workspaces LIMIT 5`;
    workspaces.forEach(w => console.log(`  - ${w.name} (${w.id})`));

    console.log('\n👥 Members:');
    const members = await sql`
      SELECT m.role, u.name, u.email, w.name as workspace
      FROM members m
      JOIN users u ON m.user_id = u.id
      JOIN workspaces w ON m.workspace_id = w.id
    `;
    members.forEach(m => console.log(`  - ${m.name} (${m.email}) - ${m.role} in ${m.workspace}`));

    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  await sql.end();
}

checkDatabase().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
