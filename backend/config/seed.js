const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runSeed() {
  const dbName = process.env.DB_DATABASE || 'legal_cases_db';
  console.log(`Connecting to database "${dbName}" to seed sample records...`);

  const connectionString = process.env.DATABASE_URL;
  const config = connectionString 
    ? { connectionString }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || '127.0.0.1',
        database: dbName,
        password: process.env.DB_PASSWORD || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432', 10),
      };

  const client = new Client(config);

  try {
    await client.connect();

    // Check if users table is populated with seeds
    const userRes = await client.query('SELECT count(*) FROM users');
    const count = parseInt(userRes.rows[0].count, 10);

    if (count > 2) {
      console.log('Database already has sample users/records. Skipping seeding.');
      return;
    }

    console.log('Seeding database with sample records...');

    // Hash passwords
    const lawyerPasswordHash = await bcrypt.hash('lawyer123', 10);

    // 1. Create Lawyers
    console.log('Inserting sample lawyers...');
    const lawyer1 = await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
      RETURNING id
    `, ['Sophia Vance', 'sophia@legal.com', lawyerPasswordHash, 'Lawyer']);

    const lawyer2 = await client.query(`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
      RETURNING id
    `, ['Daniel K. Cho', 'daniel@legal.com', lawyerPasswordHash, 'Lawyer']);

    // Link user IDs to lawyers table
    let sophiaUserId = lawyer1.rows[0]?.id;
    let danielUserId = lawyer2.rows[0]?.id;

    let sophiaLawyerId, danielLawyerId;

    if (sophiaUserId) {
      const sophiaLawyer = await client.query(`
        INSERT INTO lawyers (user_id, specialization, phone, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET specialization=EXCLUDED.specialization
        RETURNING id
      `, [sophiaUserId, 'Civil Litigation', '555-0188', 'Active']);
      sophiaLawyerId = sophiaLawyer.rows[0]?.id;
    }

    if (danielUserId) {
      const danielLawyer = await client.query(`
        INSERT INTO lawyers (user_id, specialization, phone, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET specialization=EXCLUDED.specialization
        RETURNING id
      `, [danielUserId, 'Intellectual Property (IP)', '555-0177', 'Active']);
      danielLawyerId = danielLawyer.rows[0]?.id;
    }

    // Default seeded lawyer profile (user account already exists in DB setup)
    const defaultLawyerUser = await client.query("SELECT id FROM users WHERE email = 'lawyer@legal.com'");
    let defaultLawyerId = null;
    if (defaultLawyerUser.rowCount > 0) {
      const defaultLawyerObj = await client.query(`
        INSERT INTO lawyers (user_id, specialization, phone, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET specialization=EXCLUDED.specialization
        RETURNING id
      `, [defaultLawyerUser.rows[0].id, 'Criminal Defense & Corporate Law', '555-0199', 'Active']);
      defaultLawyerId = defaultLawyerObj.rows[0]?.id;
    }

    // 2. Create Clients
    console.log('Inserting sample clients...');
    const client1 = await client.query(`
      INSERT INTO clients (name, email, phone, address, notes)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
      RETURNING id
    `, ['Acme Corp (Harvey Dent)', 'hdent@acmecorp.com', '555-0110', '100 Gotham Plaza, Suite 4B', 'Key corporate account.']);

    const client2 = await client.query(`
      INSERT INTO clients (name, email, phone, address, notes)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
      RETURNING id
    `, ['Marcus Brody', 'marcus@museum.org', '555-0120', '24 Archaeology Way, San Francisco', 'Consultation regarding intellectual property.']);

    const client3 = await client.query(`
      INSERT INTO clients (name, email, phone, address, notes)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name
      RETURNING id
    `, ['Sarah Jenkins', 'sarah.j@outlook.com', '555-0130', '772 Oakwood Drive, Chicago', 'Personal injury consultation.']);

    const cid1 = client1.rows[0]?.id;
    const cid2 = client2.rows[0]?.id;
    const cid3 = client3.rows[0]?.id;

    // 3. Create Cases
    if (cid1 && cid2 && cid3) {
      console.log('Inserting sample cases...');
      const case1 = await client.query(`
        INSERT INTO cases (case_title, case_number, case_type, court, status, filing_date, hearing_date, client_id, lawyer_id, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (case_number) DO UPDATE SET case_title=EXCLUDED.case_title
        RETURNING id
      `, [
        'Acme Corp vs. LexCorp Patent Dispute',
        'IP-2026-9812',
        'Patent / IP Infringement',
        'U.S. District Court, Delaware',
        'Active',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // in 15 days
        cid1,
        danielLawyerId || defaultLawyerId,
        'Patent dispute regarding serverless database auto-scaling technology.'
      ]);

      const case2 = await client.query(`
        INSERT INTO cases (case_title, case_number, case_type, court, status, filing_date, hearing_date, client_id, lawyer_id, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (case_number) DO UPDATE SET case_title=EXCLUDED.case_title
        RETURNING id
      `, [
        'Breach of Contract - Miller & Co',
        'CIV-2026-0045',
        'Commercial Arbitration',
        'California Superior Court, LA',
        'Active',
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // in 30 days
        cid2,
        sophiaLawyerId || defaultLawyerId,
        'Breach of supply chain logistics contract.'
      ]);

      const case3 = await client.query(`
        INSERT INTO cases (case_title, case_number, case_type, court, status, filing_date, hearing_date, client_id, lawyer_id, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (case_number) DO UPDATE SET case_title=EXCLUDED.case_title
        RETURNING id
      `, [
        'State of California vs. John Doe',
        'CR-2026-1122',
        'Criminal Defense',
        'LA County Criminal Court',
        'Pending',
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        cid3,
        defaultLawyerId,
        'Criminal defense representation for traffic violation and misdemeanor charges.'
      ]);

      const cs1 = case1.rows[0]?.id;
      const cs2 = case2.rows[0]?.id;
      const cs3 = case3.rows[0]?.id;

      // 4. Create Hearings
      if (cs1 && cs2 && cs3) {
        console.log('Inserting sample hearings...');
        await client.query(`
          INSERT INTO hearings (hearing_date, court, judge, case_id, description)
          VALUES 
          ($1, $2, $3, $4, $5),
          ($6, $7, $8, $9, $10),
          ($11, $12, $13, $14, $15)
        `, [
          new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), 'LA County Criminal Court, Room 302', 'Hon. Elizabeth Vance', cs3, 'Arraignment and plea hearing.',
          new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'U.S. District Court, Delaware, Room 4A', 'Hon. Gregory Stark', cs1, 'Hearing on motion for preliminary injunction.',
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'California Superior Court, LA, Room 10B', 'Hon. Arthur Pendelton', cs2, 'Initial status conference and discovery plan review.'
        ]);
      }
    }

    console.log('Sample seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
