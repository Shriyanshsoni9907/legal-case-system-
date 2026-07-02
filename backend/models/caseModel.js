const db = require('../config/db');
const inMemoryDb = require('./inMemoryDb');
const crypto = require('crypto');

const Case = {
  async findAll({ status, lawyerId, clientId, court, search, dateFrom, dateTo } = {}) {
    if (db.getIsMock()) {
      let results = [...inMemoryDb.cases];
      if (status) results = results.filter(c => c.status === status);
      if (lawyerId) results = results.filter(c => c.lawyer_id === lawyerId);
      if (clientId) results = results.filter(c => c.client_id === clientId);
      if (court) results = results.filter(c => c.court.toLowerCase().includes(court.toLowerCase()));
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(c =>
          c.case_title.toLowerCase().includes(q) ||
          c.case_number.toLowerCase().includes(q)
        );
      }
      // Enrich with client and lawyer names
      return results.map(c => {
        const client = inMemoryDb.clients.find(cl => cl.id === c.client_id);
        const lawyer = inMemoryDb.lawyers.find(l => l.id === c.lawyer_id);
        const lawyerUser = lawyer ? inMemoryDb.users.find(u => u.id === lawyer.user_id) : null;
        return {
          ...c,
          client_name: client ? client.name : 'Unknown',
          lawyer_name: lawyerUser ? lawyerUser.name : 'Unassigned',
        };
      });
    }

    let conditions = [];
    const params = [];
    let paramCount = 1;

    if (status) { conditions.push(`c.status = $${paramCount++}`); params.push(status); }
    if (lawyerId) { conditions.push(`c.lawyer_id = $${paramCount++}`); params.push(lawyerId); }
    if (clientId) { conditions.push(`c.client_id = $${paramCount++}`); params.push(clientId); }
    if (court) { conditions.push(`c.court ILIKE $${paramCount++}`); params.push(`%${court}%`); }
    if (search) {
      conditions.push(`(c.case_title ILIKE $${paramCount} OR c.case_number ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }
    if (dateFrom) { conditions.push(`c.filing_date >= $${paramCount++}`); params.push(dateFrom); }
    if (dateTo) { conditions.push(`c.filing_date <= $${paramCount++}`); params.push(dateTo); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT c.*, cl.name AS client_name, u.name AS lawyer_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN lawyers l ON c.lawyer_id = l.id
      LEFT JOIN users u ON l.user_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
    `;
    const { rows } = await db.query(query, params);
    return rows;
  },

  async findById(id) {
    if (db.getIsMock()) {
      const c = inMemoryDb.cases.find(c => c.id === id);
      if (!c) return null;
      const client = inMemoryDb.clients.find(cl => cl.id === c.client_id);
      const lawyer = inMemoryDb.lawyers.find(l => l.id === c.lawyer_id);
      const lawyerUser = lawyer ? inMemoryDb.users.find(u => u.id === lawyer.user_id) : null;
      return { ...c, client_name: client?.name, client_email: client?.email, lawyer_name: lawyerUser?.name, lawyer_id: c.lawyer_id };
    }
    const query = `
      SELECT c.*, cl.name AS client_name, cl.email AS client_email, cl.phone AS client_phone,
             l.id AS lawyer_table_id, u.name AS lawyer_name
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN lawyers l ON c.lawyer_id = l.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE c.id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  async create({ caseTitle, caseNumber, caseType, court, status, filingDate, hearingDate, clientId, lawyerId, description }) {
    if (db.getIsMock()) {
      const newCase = {
        id: crypto.randomUUID(),
        case_title: caseTitle,
        case_number: caseNumber,
        case_type: caseType,
        court,
        status: status || 'Pending',
        filing_date: filingDate,
        hearing_date: hearingDate || null,
        client_id: clientId,
        lawyer_id: lawyerId || null,
        description: description || '',
        created_at: new Date(),
        updated_at: new Date(),
      };
      inMemoryDb.cases.push(newCase);
      return newCase;
    }
    const query = `
      INSERT INTO cases (case_title, case_number, case_type, court, status, filing_date, hearing_date, client_id, lawyer_id, description)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `;
    const { rows } = await db.query(query, [caseTitle, caseNumber, caseType, court, status || 'Pending', filingDate, hearingDate || null, clientId, lawyerId || null, description || '']);
    return rows[0];
  },

  async update(id, { caseTitle, caseNumber, caseType, court, status, filingDate, hearingDate, clientId, lawyerId, description }) {
    if (db.getIsMock()) {
      const c = inMemoryDb.cases.find(c => c.id === id);
      if (!c) return null;
      if (caseTitle !== undefined) c.case_title = caseTitle;
      if (caseNumber !== undefined) c.case_number = caseNumber;
      if (caseType !== undefined) c.case_type = caseType;
      if (court !== undefined) c.court = court;
      if (status !== undefined) c.status = status;
      if (filingDate !== undefined) c.filing_date = filingDate;
      if (hearingDate !== undefined) c.hearing_date = hearingDate;
      if (clientId !== undefined) c.client_id = clientId;
      if (lawyerId !== undefined) c.lawyer_id = lawyerId;
      if (description !== undefined) c.description = description;
      c.updated_at = new Date();
      return c;
    }
    const query = `
      UPDATE cases SET
        case_title = COALESCE($1, case_title),
        case_number = COALESCE($2, case_number),
        case_type = COALESCE($3, case_type),
        court = COALESCE($4, court),
        status = COALESCE($5, status),
        filing_date = COALESCE($6, filing_date),
        hearing_date = COALESCE($7, hearing_date),
        client_id = COALESCE($8, client_id),
        lawyer_id = COALESCE($9, lawyer_id),
        description = COALESCE($10, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;
    const { rows } = await db.query(query, [caseTitle, caseNumber, caseType, court, status, filingDate, hearingDate, clientId, lawyerId, description, id]);
    return rows[0] || null;
  },

  async delete(id) {
    if (db.getIsMock()) {
      const idx = inMemoryDb.cases.findIndex(c => c.id === id);
      if (idx === -1) return false;
      inMemoryDb.cases.splice(idx, 1);
      return true;
    }
    const { rowCount } = await db.query('DELETE FROM cases WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = Case;
