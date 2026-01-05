const postgres = require('postgres');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seedTestUsers() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('📦 Connecting to database...');
  console.log('Connection:', connectionString.replace(/:[^:@]+@/, ':****@'));
  
  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('\n👥 Creating test users...\n');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const employeePassword = await bcrypt.hash('password@123', 10);
    console.log('🔐 Passwords hashed');

    // Check if users exist
    const existingAdmin = await sql`SELECT id FROM users WHERE email = 'varun@pms.com'`;
    const existingEmployee = await sql`SELECT id FROM users WHERE email = 'karthikeyan@pms.com'`;

    let adminUserId, employeeUserId;

    // Create or get admin user
    if (existingAdmin.length > 0) {
      adminUserId = existingAdmin[0].id;
      console.log('✓ Admin user varun@pms.com already exists');
    } else {
      const [adminUser] = await sql`
        INSERT INTO users (id, name, email, password, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Varun', 'varun@pms.com', ${adminPassword}, now(), now())
        RETURNING id
      `;
      adminUserId = adminUser.id;
      console.log('✓ Admin user varun@pms.com created');
    }

    // Create or get employee user
    if (existingEmployee.length > 0) {
      employeeUserId = existingEmployee[0].id;
      console.log('✓ Employee user karthikeyan@pms.com already exists');
    } else {
      const [employeeUser] = await sql`
        INSERT INTO users (id, name, email, password, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Karthikeyan', 'karthikeyan@pms.com', ${employeePassword}, now(), now())
        RETURNING id
      `;
      employeeUserId = employeeUser.id;
      console.log('✓ Employee user karthikeyan@pms.com created');
    }

    // Get or create workspace
    const existingWorkspace = await sql`SELECT id, name FROM workspaces LIMIT 1`;
    let workspaceId;

    if (existingWorkspace.length > 0) {
      workspaceId = existingWorkspace[0].id;
      console.log(`✓ Using existing workspace: ${existingWorkspace[0].name}`);
    } else {
      const [newWorkspace] = await sql`
        INSERT INTO workspaces (id, name, user_id, image_url, invite_code, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Employee Management System', ${adminUserId}, null, 'EMS2026', now(), now())
        RETURNING id, name
      `;
      workspaceId = newWorkspace.id;
      console.log(`✓ Workspace created: ${newWorkspace.name}`);
    }

    // Check and add admin as ADMIN member
    const existingAdminMember = await sql`
      SELECT id, role FROM members WHERE user_id = ${adminUserId} AND workspace_id = ${workspaceId}
    `;

    if (existingAdminMember.length > 0) {
      console.log(`✓ Admin already member with role: ${existingAdminMember[0].role}`);
    } else {
      await sql`
        INSERT INTO members (user_id, workspace_id, role, created_at, updated_at)
        VALUES (${adminUserId}, ${workspaceId}, 'ADMIN', now(), now())
      `;
      console.log('✓ Admin added to workspace with ADMIN role');
    }

    // Check and add employee as MEMBER
    const existingEmployeeMember = await sql`
      SELECT id, role FROM members WHERE user_id = ${employeeUserId} AND workspace_id = ${workspaceId}
    `;

    if (existingEmployeeMember.length > 0) {
      console.log(`✓ Employee already member with role: ${existingEmployeeMember[0].role}`);
    } else {
      await sql`
        INSERT INTO members (user_id, workspace_id, role, created_at, updated_at)
        VALUES (${employeeUserId}, ${workspaceId}, 'MEMBER', now(), now())
      `;
      console.log('✓ Employee added to workspace with MEMBER role');
    }

    console.log('\n✅ Test users setup completed!\n');
    console.log('📋 Login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍💼 Admin Access:');
    console.log('   Email: varun@pms.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👤 Employee Access:');
    console.log('   Email: karthikeyan@pms.com');
    console.log('   Password: password@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
  
  await sql.end();
}

seedTestUsers().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
