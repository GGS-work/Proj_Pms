import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from '../src/db/schema';

const { users } = schema;

config({ path: '.env.local' });

async function checkAllUsers() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    console.log('\n📊 Checking all users in database...\n');

    const allUsers = await db.select().from(users);

    console.log(`\n✅ Total users in database: ${allUsers.length}\n`);
    console.table(allUsers.map(u => ({
      ID: u.id.substring(0, 8),
      Name: u.name,
      Email: u.email,
      Created: u.createdAt?.toISOString().split('T')[0]
    })));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  await client.end();
}

checkAllUsers();
