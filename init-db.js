const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { migrate } = require('drizzle-orm/postgres-js/migrator');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('📦 Connecting to database...');
  console.log('Connection:', connectionString.replace(/:[^:@]+@/, ':****@'));
  
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log('🚀 Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Database migrations completed successfully!');
    console.log('📊 All tables have been created.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
  
  await sql.end();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
