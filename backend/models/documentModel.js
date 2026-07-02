const db = require('../config/db');
const inMemoryDb = require('./inMemoryDb');
const crypto = require('crypto');

const Document = {
  async findByCaseId(caseId) {
    if (db.getIsMock()) {
      const docs = inMemoryDb.documents.filter(d => d.case_id === caseId);
      return docs.map(d => {
        const uploader = inMemoryDb.users.find(u => u.id === d.uploaded_by);
        return { ...d, uploader_name: uploader ? uploader.name : 'Unknown' };
      });
    }
    const query = `
      SELECT d.*, u.name AS uploader_name
      FROM documents d
      JOIN users u ON d.uploaded_by = u.id
      WHERE d.case_id = $1
      ORDER BY d.created_at DESC
    `;
    const { rows } = await db.query(query, [caseId]);
    return rows;
  },

  async findById(id) {
    if (db.getIsMock()) return inMemoryDb.documents.find(d => d.id === id) || null;
    const { rows } = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async create({ fileName, filePath, fileSize, mimeType, caseId, uploadedBy }) {
    if (db.getIsMock()) {
      const doc = { id: crypto.randomUUID(), file_name: fileName, file_path: filePath, file_size: fileSize, mime_type: mimeType, case_id: caseId, uploaded_by: uploadedBy, created_at: new Date(), updated_at: new Date() };
      inMemoryDb.documents.push(doc);
      return doc;
    }
    const query = `INSERT INTO documents (file_name, file_path, file_size, mime_type, case_id, uploaded_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const { rows } = await db.query(query, [fileName, filePath, fileSize, mimeType, caseId, uploadedBy]);
    return rows[0];
  },

  async delete(id) {
    if (db.getIsMock()) {
      const idx = inMemoryDb.documents.findIndex(d => d.id === id);
      if (idx === -1) return null;
      const [doc] = inMemoryDb.documents.splice(idx, 1);
      return doc;
    }
    const { rows } = await db.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  },
};

module.exports = Document;
