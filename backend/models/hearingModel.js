const db = require('../config/db');
const inMemoryDb = require('./inMemoryDb');
const crypto = require('crypto');

const Hearing = {
  async findAll(caseId = null) {
    if (db.getIsMock()) {
      let results = caseId ? inMemoryDb.hearings.filter(h => h.case_id === caseId) : [...inMemoryDb.hearings];
      return results.map(h => {
        const c = inMemoryDb.cases.find(c => c.id === h.case_id);
        return { ...h, case_title: c ? c.case_title : 'Unknown', case_number: c ? c.case_number : '' };
      }).sort((a, b) => new Date(a.hearing_date) - new Date(b.hearing_date));
    }
    const conditions = caseId ? 'WHERE h.case_id = $1' : '';
    const params = caseId ? [caseId] : [];
    const query = `
      SELECT h.*, c.case_title, c.case_number
      FROM hearings h
      JOIN cases c ON h.case_id = c.id
      ${conditions}
      ORDER BY h.hearing_date ASC
    `;
    const { rows } = await db.query(query, params);
    return rows;
  },

  async findUpcoming(limit = 10) {
    if (db.getIsMock()) {
      const now = new Date();
      return inMemoryDb.hearings
        .filter(h => new Date(h.hearing_date) >= now)
        .sort((a, b) => new Date(a.hearing_date) - new Date(b.hearing_date))
        .slice(0, limit)
        .map(h => {
          const c = inMemoryDb.cases.find(c => c.id === h.case_id);
          return { ...h, case_title: c?.case_title, case_number: c?.case_number };
        });
    }
    const query = `
      SELECT h.*, c.case_title, c.case_number
      FROM hearings h JOIN cases c ON h.case_id = c.id
      WHERE h.hearing_date >= NOW()
      ORDER BY h.hearing_date ASC
      LIMIT $1
    `;
    const { rows } = await db.query(query, [limit]);
    return rows;
  },

  async findById(id) {
    if (db.getIsMock()) return inMemoryDb.hearings.find(h => h.id === id) || null;
    const { rows } = await db.query('SELECT * FROM hearings WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ hearingDate, court, judge, caseId, description }) {
    if (db.getIsMock()) {
      const h = { id: crypto.randomUUID(), hearing_date: hearingDate, court, judge, case_id: caseId, description: description || '', created_at: new Date(), updated_at: new Date() };
      inMemoryDb.hearings.push(h);
      return h;
    }
    const query = `INSERT INTO hearings (hearing_date, court, judge, case_id, description) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const { rows } = await db.query(query, [hearingDate, court, judge, caseId, description || '']);
    return rows[0];
  },

  async update(id, { hearingDate, court, judge, description }) {
    if (db.getIsMock()) {
      const h = inMemoryDb.hearings.find(h => h.id === id);
      if (!h) return null;
      if (hearingDate !== undefined) h.hearing_date = hearingDate;
      if (court !== undefined) h.court = court;
      if (judge !== undefined) h.judge = judge;
      if (description !== undefined) h.description = description;
      h.updated_at = new Date();
      return h;
    }
    const query = `
      UPDATE hearings SET
        hearing_date = COALESCE($1, hearing_date),
        court = COALESCE($2, court),
        judge = COALESCE($3, judge),
        description = COALESCE($4, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 RETURNING *
    `;
    const { rows } = await db.query(query, [hearingDate, court, judge, description, id]);
    return rows[0] || null;
  },

  async delete(id) {
    if (db.getIsMock()) {
      const idx = inMemoryDb.hearings.findIndex(h => h.id === id);
      if (idx === -1) return false;
      inMemoryDb.hearings.splice(idx, 1);
      return true;
    }
    const { rowCount } = await db.query('DELETE FROM hearings WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = Hearing;
