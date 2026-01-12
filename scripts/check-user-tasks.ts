import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

const { users, tasks } = schema;

config({ path: '.env.local' });

async function checkUserTasks() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    console.log('\n📊 Checking tasks for each user...\n');

    const allUsers = await db.select().from(users);

    for (const user of allUsers) {
      console.log(`\n👤 User: ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      
      const userTasks = await db
        .select({
          id: tasks.id,
          summary: tasks.summary,
          assigneeId: tasks.assigneeId,
          projectId: tasks.projectId,
          status: tasks.status,
        })
        .from(tasks)
        .where(eq(tasks.assigneeId, user.id));
      
      if (userTasks.length === 0) {
        console.log('   ❌ No tasks assigned to this user');
      } else {
        console.log(`   ✅ ${userTasks.length} task(s) assigned:`);
        userTasks.forEach(task => {
          console.log(`      - ${task.summary} (${task.status})`);
          console.log(`        Project ID: ${task.projectId || 'No project'}`);
        });
      }
    }

    console.log('\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  await client.end();
}

checkUserTasks();
