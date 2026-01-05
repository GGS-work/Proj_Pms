const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function createUserSessionsTable() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('📦 Connecting to database...');
  const sql = postgres(connectionString, { max: 1 });

  try {
    console.log('🔧 Creating user_sessions table...\n');

    // Create user_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        session_token text PRIMARY KEY NOT NULL,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires timestamp NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log('✓ user_sessions table created');

    // Create index on user_id for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id)
    `;
    console.log('✓ Index created on user_id');

    // Create index on expires for cleanup queries
    await sql`
      CREATE INDEX IF NOT EXISTS user_sessions_expires_idx ON user_sessions(expires)
    `;
    console.log('✓ Index created on expires');

    console.log('\n✅ user_sessions table setup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
  
  await sql.end();
}

createUserSessionsTable().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
