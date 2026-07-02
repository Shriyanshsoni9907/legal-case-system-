const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  const dbName = process.env.DB_DATABASE || 'legal_cases_db';
  
  // Connection details for master postgres database to check/create the target database
  const masterConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: 'postgres', // default system db
  };

  console.log(`Connecting to default database to check if "${dbName}" exists...`);
  const client = new Client(masterConfig);
  
  try {
    await client.connect();
    
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      // Disable transaction/auto-commit behavior for CREATE DATABASE
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error checking/creating database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Connect to the newly created/existing target database
  console.log(`Connecting directly to database "${dbName}" to run schema...`);
  const targetConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    database: dbName,
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  };

  const targetClient = new Client(targetConfig);

  try {
    await targetClient.connect();
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing schema.sql...');
    await targetClient.query(sql);
    console.log('Database tables, indices, and triggers configured successfully.');
  } catch (err) {
    console.error('Error executing schema.sql:', err.message);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
