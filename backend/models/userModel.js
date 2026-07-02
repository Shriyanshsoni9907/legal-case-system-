const db = require('../config/db');
const inMemoryDb = require('./inMemoryDb');
const crypto = require('crypto');

const User = {
  // Find a user by email address (for signup validation and login)
  async findByEmail(email) {
    if (db.getIsMock()) {
      const emailLower = email.toLowerCase().trim();
      return inMemoryDb.users.find(u => u.email.toLowerCase().trim() === emailLower) || null;
    }
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0] || null;
  },

  // Find a user by their UUID
  async findById(id) {
    if (db.getIsMock()) {
      return inMemoryDb.users.find(u => u.id === id) || null;
    }
    const query = 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  // Create a new user record
  async create({ name, email, passwordHash, role }) {
    if (db.getIsMock()) {
      const newUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role,
        created_at: new Date(),
        updated_at: new Date(),
      };
      inMemoryDb.users.push(newUser);
      return newUser;
    }
    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `;
    const { rows } = await db.query(query, [name.trim(), email.toLowerCase().trim(), passwordHash, role]);
    return rows[0];
  },
};

module.exports = User;
