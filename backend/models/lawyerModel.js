const db = require('../config/db');
const inMemoryDb = require('./inMemoryDb');
const crypto = require('crypto');

const Lawyer = {
  // Find lawyer details by their user ID
  async findByUserId(userId) {
    if (db.getIsMock()) {
      return inMemoryDb.lawyers.find(l => l.user_id === userId) || null;
    }
    const query = 'SELECT * FROM lawyers WHERE user_id = $1';
    const { rows } = await db.query(query, [userId]);
    return rows[0] || null;
  },

  // Find lawyer by lawyer table primary key
  async findById(id) {
    if (db.getIsMock()) {
      const lawyer = inMemoryDb.lawyers.find(l => l.id === id);
      if (!lawyer) return null;
      const user = inMemoryDb.users.find(u => u.id === lawyer.user_id);
      return { ...lawyer, name: user ? user.name : '', email: user ? user.email : '' };
    }
    const query = `
      SELECT l.*, u.name, u.email
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  // List all lawyers with user details
  async findAll() {
    if (db.getIsMock()) {
      return inMemoryDb.lawyers.map(l => {
        const user = inMemoryDb.users.find(u => u.id === l.user_id);
        return {
          id: l.id,
          user_id: l.user_id,
          name: user ? user.name : 'Unknown',
          email: user ? user.email : 'Unknown',
          specialization: l.specialization,
          phone: l.phone,
          status: l.status,
          created_at: l.created_at,
          updated_at: l.updated_at,
        };
      });
    }
    const query = `
      SELECT l.id, l.user_id, u.name, u.email, l.specialization, l.phone, l.status, l.created_at, l.updated_at
      FROM lawyers l
      JOIN users u ON l.user_id = u.id
      ORDER BY u.name ASC
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  // Create lawyer profile details
  async create({ userId, phone, specialization, status }) {
    if (db.getIsMock()) {
      const newLawyer = {
        id: crypto.randomUUID(),
        user_id: userId,
        phone: phone || '',
        specialization: specialization || '',
        status: status || 'Active',
        created_at: new Date(),
        updated_at: new Date(),
      };
      inMemoryDb.lawyers.push(newLawyer);
      return newLawyer;
    }
    const query = `
      INSERT INTO lawyers (user_id, phone, specialization, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, phone, specialization, status, created_at, updated_at
    `;
    const { rows } = await db.query(query, [userId, phone, specialization, status || 'Active']);
    return rows[0];
  },

  // Update lawyer profile details
  async update(id, { name, phone, specialization, status }) {
    if (db.getIsMock()) {
      const lawyer = inMemoryDb.lawyers.find(l => l.id === id);
      if (!lawyer) return null;
      
      if (phone !== undefined) lawyer.phone = phone;
      if (specialization !== undefined) lawyer.specialization = specialization;
      if (status !== undefined) lawyer.status = status;
      lawyer.updated_at = new Date();

      if (name !== undefined) {
        const user = inMemoryDb.users.find(u => u.id === lawyer.user_id);
        if (user) {
          user.name = name;
          user.updated_at = new Date();
        }
      }
      
      const user = inMemoryDb.users.find(u => u.id === lawyer.user_id);
      return {
        ...lawyer,
        name: user ? user.name : '',
        email: user ? user.email : '',
      };
    }

    // DB transaction for safety since we update users and lawyers
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update lawyer fields
      const updateLawyerQuery = `
        UPDATE lawyers
        SET phone = COALESCE($1, phone),
            specialization = COALESCE($2, specialization),
            status = COALESCE($3, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `;
      const lawyerRes = await client.query(updateLawyerQuery, [phone, specialization, status, id]);
      const lawyer = lawyerRes.rows[0];

      if (!lawyer) {
        await client.query('ROLLBACK');
        return null;
      }

      // Update user fields
      let nameToReturn = '';
      let emailToReturn = '';
      if (name) {
        const updateUserQuery = `
          UPDATE users
          SET name = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING name, email
        `;
        const userRes = await client.query(updateUserQuery, [name, lawyer.user_id]);
        if (userRes.rows[0]) {
          nameToReturn = userRes.rows[0].name;
          emailToReturn = userRes.rows[0].email;
        }
      } else {
        const userRes = await client.query('SELECT name, email FROM users WHERE id = $1', [lawyer.user_id]);
        if (userRes.rows[0]) {
          nameToReturn = userRes.rows[0].name;
          emailToReturn = userRes.rows[0].email;
        }
      }

      await client.query('COMMIT');
      return {
        ...lawyer,
        name: nameToReturn,
        email: emailToReturn,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Delete lawyer (removes User, cascading to Lawyer details)
  async delete(id) {
    if (db.getIsMock()) {
      const index = inMemoryDb.lawyers.findIndex(l => l.id === id);
      if (index === -1) return false;
      const lawyer = inMemoryDb.lawyers[index];
      
      // Remove user (cascading equivalent)
      const userIndex = inMemoryDb.users.findIndex(u => u.id === lawyer.user_id);
      if (userIndex !== -1) inMemoryDb.users.splice(userIndex, 1);
      
      inMemoryDb.lawyers.splice(index, 1);
      return true;
    }
    
    // Find lawyer first to get user_id
    const findQuery = 'SELECT user_id FROM lawyers WHERE id = $1';
    const { rows } = await db.query(findQuery, [id]);
    if (rows.length === 0) return false;
    const userId = rows[0].user_id;

    // Delete user which will cascade delete the lawyer
    const deleteQuery = 'DELETE FROM users WHERE id = $1';
    await db.query(deleteQuery, [userId]);
    return true;
  }
};

module.exports = Lawyer;
