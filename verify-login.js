import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function verifyLogin() {
  try {
    console.log('🔍 Checking user credentials...\n');
    
    // Get the user
    const users = await sql`
      SELECT id, name, email, password 
      FROM users 
      WHERE email = 'varun@pms.com'
    `;

    if (users.length === 0) {
      console.log('❌ User varun@pms.com not found!');
      process.exit(1);
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Has password hash:', !!user.password);
    console.log('   Password hash:', user.password?.substring(0, 30) + '...');
    
    // Test password
    console.log('\n🔐 Testing password "admin123"...');
    const isValid = await bcrypt.compare('admin123', user.password);
    
    if (isValid) {
      console.log('✅ Password is CORRECT');
    } else {
      console.log('❌ Password is INCORRECT');
      console.log('\n🔄 Fixing password...');
      
      // Hash the correct password
      const newHash = await bcrypt.hash('admin123', 10);
      
      // Update the user
      await sql`
        UPDATE users 
        SET password = ${newHash}
        WHERE id = ${user.id}
      `;
      
      console.log('✅ Password updated successfully!');
    }
    
    console.log('\n✅ Login credentials ready:');
    console.log('   Email: varun@pms.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

verifyLogin();
