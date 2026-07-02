const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_DATABASE || 'legal_cases_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  connectionTimeoutMillis: 2000, // 2-second timeout to fail-fast if Postgres isn't running
});

let isMock = false;

async function checkConnection() {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL database connected successfully.');
    client.release();
  } catch (err) {
    isMock = true;
    console.warn('\n========================================================================');
    console.warn('WARNING: PostgreSQL connection failed.');
    console.warn(`Reason: ${err.message}`);
    console.warn('SYSTEM IS FALLING BACK TO AN IN-MEMORY DATABASE FOR PREVIEW MODE.');
    console.warn('API endpoints will work, but data will reset when the server restarts.');
    console.warn('========================================================================\n');
  }
}

checkConnection();

module.exports = {
  query: (text, params) => {
    if (isMock) {
      throw new Error('Database is running in In-Memory fallback mode. Raw SQL query is disabled.');
    }
    return pool.query(text, params);
  },
  pool,
  getIsMock: () => isMock,
  setIsMock: (val) => { isMock = val; }
};
