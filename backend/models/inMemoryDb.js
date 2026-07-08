const bcrypt = require('bcryptjs');

// In-Memory Database store
const db = {
  users: [],
  lawyers: [],
  clients: [],
  cases: [],
  documents: [],
  hearings: [],
};

// Seed function to pre-populate default accounts and records
async function seedDefaultUsers() {
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const lawyerPasswordHash = await bcrypt.hash('lawyer123', 10);

  const adminId = '11111111-1111-1111-1111-111111111111';
  const lawyerUserId = '22222222-2222-2222-2222-222222222222';
  const lawyerId = '33333333-3333-3333-3333-333333333333';

  // Seed Admin User
  db.users.push({
    id: adminId,
    name: 'Admin',
    email: 'admin@legal.com',
    password_hash: adminPasswordHash,
    role: 'Admin',
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Seed Lawyer User
  db.users.push({
    id: lawyerUserId,
    name: 'Lawyer',
    email: 'lawyer@legal.com',
    password_hash: lawyerPasswordHash,
    role: 'Lawyer',
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Seed Lawyer Profile
  db.lawyers.push({
    id: lawyerId,
    user_id: lawyerUserId,
    specialization: 'Criminal Defense & Corporate Law',
    phone: '555-0199',
    status: 'Active',
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Additional Seed Lawyer 2
  const lawyerUserId2 = '22222222-2222-2222-2222-222222222223';
  const lawyerId2 = '33333333-3333-3333-3333-333333333334';
  db.users.push({
    id: lawyerUserId2,
    name: 'Sophia Vance',
    email: 'sophia@legal.com',
    password_hash: lawyerPasswordHash,
    role: 'Lawyer',
    created_at: new Date(),
    updated_at: new Date(),
  });
  db.lawyers.push({
    id: lawyerId2,
    user_id: lawyerUserId2,
    specialization: 'Civil Litigation',
    phone: '555-0188',
    status: 'Active',
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Additional Seed Lawyer 3
  const lawyerUserId3 = '22222222-2222-2222-2222-222222222224';
  const lawyerId3 = '33333333-3333-3333-3333-333333333335';
  db.users.push({
    id: lawyerUserId3,
    name: 'Daniel K. Cho',
    email: 'daniel@legal.com',
    password_hash: lawyerPasswordHash,
    role: 'Lawyer',
    created_at: new Date(),
    updated_at: new Date(),
  });
  db.lawyers.push({
    id: lawyerId3,
    user_id: lawyerUserId3,
    specialization: 'Intellectual Property (IP)',
    phone: '555-0177',
    status: 'Active',
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Seed Clients
  const clientId1 = '44444444-4444-4444-4444-444444444444';
  const clientId2 = '44444444-4444-4444-4444-444444444445';
  const clientId3 = '44444444-4444-4444-4444-444444444446';
  db.clients.push(
    {
      id: clientId1,
      name: 'Acme Corp (Harvey Dent)',
      email: 'hdent@acmecorp.com',
      phone: '555-0110',
      address: '100 Gotham Plaza, Suite 4B',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: clientId2,
      name: 'Marcus Brody',
      email: 'marcus@museum.org',
      phone: '555-0120',
      address: '24 Archaeology Way, San Francisco',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: clientId3,
      name: 'Sarah Jenkins',
      email: 'sarah.j@outlook.com',
      phone: '555-0130',
      address: '772 Oakwood Drive, Chicago',
      created_at: new Date(),
      updated_at: new Date(),
    }
  );

  // Seed Cases
  const caseId1 = '55555555-5555-5555-5555-555555555555';
  const caseId2 = '55555555-5555-5555-5555-555555555556';
  const caseId3 = '55555555-5555-5555-5555-555555555557';
  
  db.cases.push(
    {
      id: caseId1,
      case_title: 'Acme Corp vs. LexCorp Patent Dispute',
      case_number: 'IP-2026-9812',
      case_type: 'Patent / IP Infringement',
      court: 'U.S. District Court, Delaware',
      status: 'Active',
      filing_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      hearing_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // in 15 days
      client_id: clientId1,
      lawyer_id: lawyerId3, // Daniel (IP lawyer)
      description: 'Patent dispute regarding serverless database auto-scaling technology.',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: caseId2,
      case_title: 'Breach of Contract - Miller & Co',
      case_number: 'CIV-2026-0045',
      case_type: 'Commercial Arbitration',
      court: 'California Superior Court, LA',
      status: 'Active',
      filing_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      hearing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // in 30 days
      client_id: clientId2,
      lawyer_id: lawyerId2, // Sophia Vance
      description: 'Breach of supply chain logistics contract.',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: caseId3,
      case_title: 'State of California vs. John Doe',
      case_number: 'CR-2026-1122',
      case_type: 'Criminal Defense',
      court: 'LA County Criminal Court',
      status: 'Pending',
      filing_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      hearing_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      client_id: clientId3,
      lawyer_id: lawyerId, // Lawyer (default criminal defense)
      description: 'Criminal defense representation for traffic violation and secondary misdemeanor charges.',
      created_at: new Date(),
      updated_at: new Date(),
    }
  );

  // Seed Hearings
  db.hearings.push(
    {
      id: '66666666-6666-6666-6666-666666666666',
      case_id: caseId3,
      hearing_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow!
      court: 'LA County Criminal Court, Room 302',
      judge: 'Hon. Elizabeth Vance',
      description: 'Arraignment and plea hearing.',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '66666666-6666-6666-6666-666666666667',
      case_id: caseId1,
      hearing_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      court: 'U.S. District Court, Delaware, Room 4A',
      judge: 'Hon. Gregory Stark',
      description: 'Hearing on motion for preliminary injunction.',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '66666666-6666-6666-6666-666666666668',
      case_id: caseId2,
      hearing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      court: 'California Superior Court, LA, Room 10B',
      judge: 'Hon. Arthur Pendelton',
      description: 'Initial status conference and discovery plan review.',
      created_at: new Date(),
      updated_at: new Date(),
    }
  );
}

// Run seeds immediately
seedDefaultUsers().then(() => {
  console.log('In-Memory database seeded with default accounts and sample data:');
  console.log(' - Admin: admin@legal.com / admin123');
  console.log(' - Lawyer: lawyer@legal.com / lawyer123');
});

module.exports = db;
