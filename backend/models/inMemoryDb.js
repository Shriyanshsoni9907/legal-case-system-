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

// Seed function to pre-populate default accounts
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
}

// Run seeds immediately
seedDefaultUsers().then(() => {
  console.log('In-Memory database seeded with default accounts:');
  console.log(' - Admin: admin@legal.com / admin123');
  console.log(' - Lawyer: lawyer@legal.com / lawyer123');
});

module.exports = db;
