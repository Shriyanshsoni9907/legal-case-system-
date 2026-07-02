const db = require('../config/db');
const inMemoryDb = require('./inMemoryDb');
const crypto = require('crypto');

const Client = {
  // Find client by UUID
  async findById(id) {
    if (db.getIsMock()) {
      return inMemoryDb.clients.find(c => c.id === id) || null;
    }
    const query = 'SELECT * FROM clients WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  // Find client by email address (to prevent duplicates)
  async findByEmail(email) {
    if (db.getIsMock()) {
      const emailLower = email.toLowerCase().trim();
      return inMemoryDb.clients.find(c => c.email.toLowerCase().trim() === emailLower) || null;
    }
    const query = 'SELECT * FROM clients WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0] || null;
  },

  // Retrieve all clients, supporting optional search filter across name, email, and phone
  async findAll(searchQuery = '') {
    if (db.getIsMock()) {
      let results = [...inMemoryDb.clients];
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase().trim();
        results = results.filter(c => 
          c.name.toLowerCase().includes(queryLower) ||
          c.email.toLowerCase().includes(queryLower) ||
          c.phone.includes(queryLower)
        );
      }
      return results;
    }

    let query = 'SELECT * FROM clients';
    const params = [];

    if (searchQuery) {
      query += ` WHERE 
        name ILIKE $1 OR 
        email ILIKE $1 OR 
        phone ILIKE $1`;
      params.push(`%${searchQuery}%`);
    }

    query += ' ORDER BY name ASC';
    const { rows } = await db.query(query, params);
    return rows;
  },

  // Create client record
  async create({ name, phone, email, address, notes }) {
    if (db.getIsMock()) {
      const newClient = {
        id: crypto.randomUUID(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        address: address ? address.trim() : '',
        notes: notes ? notes.trim() : '',
        created_at: new Date(),
        updated_at: new Date(),
      };
      inMemoryDb.clients.push(newClient);
      return newClient;
    }

    const query = `
      INSERT INTO clients (name, phone, email, address, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await db.query(query, [
      name.trim(),
      phone.trim(),
      email.toLowerCase().trim(),
      address ? address.trim() : '',
      notes ? notes.trim() : '',
    ]);
    return rows[0];
  },

  // Update client details
  async update(id, { name, phone, email, address, notes }) {
    if (db.getIsMock()) {
      const client = inMemoryDb.clients.find(c => c.id === id);
      if (!client) return null;

      if (name !== undefined) client.name = name.trim();
      if (phone !== undefined) client.phone = phone.trim();
      if (email !== undefined) client.email = email.toLowerCase().trim();
      if (address !== undefined) client.address = address.trim();
      if (notes !== undefined) client.notes = notes.trim();
      client.updated_at = new Date();

      return client;
    }

    const query = `
      UPDATE clients
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          address = COALESCE($4, address),
          notes = COALESCE($5, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    const { rows } = await db.query(query, [name, phone, email, address, notes, id]);
    return rows[0] || null;
  },

  // Delete client record
  async delete(id) {
    if (db.getIsMock()) {
      const index = inMemoryDb.clients.findIndex(c => c.id === id);
      if (index === -1) return false;
      inMemoryDb.clients.splice(index, 1);
      return true;
    }

    const query = 'DELETE FROM clients WHERE id = $1';
    const { rowCount } = await db.query(query, [id]);
    return rowCount > 0;
  },
};

module.exports = Client;
