import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function testSystemIssues() {
  try {
    console.log('🔍 Testing System Issues...\n');

    // 1. Test project creation permissions
    console.log('1️⃣ Checking Admin User for Project Creation:');
    const adminUser = await sql`
      SELECT u.id, u.name, u.email, m.role
      FROM users u
      LEFT JOIN members m ON u.id = m.user_id
      WHERE u.email = 'varun@pms.com'
      LIMIT 1
    `;
    
    if (adminUser.length > 0) {
      console.log('   ✅ Admin user found:', adminUser[0].name);
      console.log('   Role:', adminUser[0].role);
      console.log('   Can create projects:', ['ADMIN', 'PROJECT_MANAGER', 'MANAGEMENT'].includes(adminUser[0].role));
    } else {
      console.log('   ❌ Admin user not found!');
    }

    // 2. Test attendance table structure
    console.log('\n2️⃣ Checking Attendance Table Structure:');
    const attendanceColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'attendance'
      ORDER BY ordinal_position
    `;
    console.log('   Columns:', attendanceColumns.map(c => c.column_name).join(', '));
    
    const requiredCols = ['shift_start_time', 'shift_end_time', 'total_duration', 'end_activity', 'daily_tasks'];
    const missingCols = requiredCols.filter(col => !attendanceColumns.some(c => c.column_name === col));
    
    if (missingCols.length > 0) {
      console.log('   ❌ Missing columns:', missingCols.join(', '));
    } else {
      console.log('   ✅ All required columns present');
    }

    // 3. Test notifications table structure
    console.log('\n3️⃣ Checking Notifications Table Structure:');
    const notificationColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position
    `;
    console.log('   Columns:', notificationColumns.map(c => c.column_name).join(', '));
    
    const notifRequiredCols = ['action_by', 'action_by_name', 'is_read', 'read_at'];
    const notifMissingCols = notifRequiredCols.filter(col => !notificationColumns.some(c => c.column_name === col));
    
    if (notifMissingCols.length > 0) {
      console.log('   ❌ Missing columns:', notifMissingCols.join(', '));
    } else {
      console.log('   ✅ All required columns present');
    }

    // 4. Test projects table for assignees column
    console.log('\n4️⃣ Checking Projects Table for Assignees:');
    const projectColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'projects'
      AND column_name = 'assignees'
    `;
    
    if (projectColumns.length > 0) {
      console.log('   ✅ Assignees column exists');
      console.log('   Type:', projectColumns[0].data_type);
    } else {
      console.log('   ❌ Assignees column missing!');
      console.log('   📝 Need to add: assignees text[]');
    }

    // 5. Check for any active shifts
    console.log('\n5️⃣ Checking Active Shifts:');
    const activeShifts = await sql`
      SELECT id, user_id, shift_start_time, shift_end_time
      FROM attendance
      WHERE shift_end_time IS NULL
      LIMIT 5
    `;
    console.log('   Active shifts:', activeShifts.length);
    if (activeShifts.length > 0) {
      activeShifts.forEach(shift => {
        console.log(`   - User: ${shift.user_id.substring(0, 8)}..., Started: ${shift.shift_start_time}`);
      });
    }

    console.log('\n✅ System check complete!');
    
  } catch (error) {
    console.error('❌ Error during system check:', error);
  } finally {
    await sql.end();
  }
}

testSystemIssues();
