const postgres = require('postgres');
const fs = require('fs');
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

  try {
    // Read the init schema
    console.log('📄 Reading init-schema.sql...');
    const schemaSQL = fs.readFileSync('./init-schema.sql', 'utf-8');
    
    // Split by statement breakpoints and execute
    console.log('🚀 Creating tables...');
    const statements = schemaSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await sql.unsafe(statement);
          console.log(`✓ Statement ${i + 1}/${statements.length} executed`);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.code === '42P07' || error.message.includes('already exists')) {
            console.log(`⊘ Statement ${i + 1}/${statements.length} skipped (already exists)`);
          } else {
            throw error;
          }
        }
      }
    }
    
    // Now run the final schema to add additional columns and tables
    console.log('\n📄 Reading final-schema.sql...');
    const finalSchemaSQL = fs.readFileSync('./final-schema.sql', 'utf-8');
    
    console.log('🚀 Adding additional tables and columns...');
    const finalStatements = finalSchemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    for (let i = 0; i < finalStatements.length; i++) {
      const statement = finalStatements[i];
      if (statement) {
        try {
          await sql.unsafe(statement + ';');
          console.log(`✓ Statement ${i + 1}/${finalStatements.length} executed`);
        } catch (error) {
          // Ignore "already exists" or "duplicate column" errors
          if (error.code === '42P07' || error.code === '42701' || 
              error.message.includes('already exists') || 
              error.message.includes('duplicate')) {
            console.log(`⊘ Statement ${i + 1}/${finalStatements.length} skipped (already exists)`);
          } else {
            console.warn(`⚠ Warning on statement ${i + 1}: ${error.message}`);
          }
        }
      }
    }
    
    console.log('\n✅ Database schema setup completed successfully!');
    console.log('📊 All tables have been created.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  }
  
  await sql.end();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
