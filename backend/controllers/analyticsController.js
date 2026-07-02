const db = require('../config/db');
const inMemoryDb = require('../models/inMemoryDb');

exports.getDashboardStats = async (req, res, next) => {
  try {
    if (db.getIsMock()) {
      const cases = inMemoryDb.cases;
      const statuses = ['Pending', 'Active', 'Closed', 'On Hold'];
      const casesByStatus = statuses.map(s => ({ status: s, count: cases.filter(c => c.status === s).length }));

      // Cases by month (last 6 months)
      const now = new Date();
      const casesByMonth = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        const count = cases.filter(c => {
          const cd = new Date(c.created_at);
          return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
        }).length;
        return { month: label, count };
      });

      // Cases by lawyer
      const casesByLawyer = inMemoryDb.lawyers.map(l => {
        const user = inMemoryDb.users.find(u => u.id === l.user_id);
        const count = cases.filter(c => c.lawyer_id === l.id).length;
        return { lawyer_name: user?.name || 'Unknown', count };
      });

      // Upcoming hearings
      const upcomingHearings = inMemoryDb.hearings
        .filter(h => new Date(h.hearing_date) >= new Date())
        .sort((a, b) => new Date(a.hearing_date) - new Date(b.hearing_date))
        .slice(0, 5)
        .map(h => {
          const c = inMemoryDb.cases.find(c => c.id === h.case_id);
          return { ...h, case_title: c?.case_title, case_number: c?.case_number };
        });

      return res.status(200).json({
        status: 'success',
        data: {
          totalCases: cases.length,
          totalLawyers: inMemoryDb.lawyers.length,
          totalClients: inMemoryDb.clients.length,
          upcomingHearingsCount: upcomingHearings.length,
          casesByStatus,
          casesByMonth,
          casesByLawyer,
          upcomingHearings,
        },
      });
    }

    const [totalCases, totalLawyers, totalClients, upcomingHearingsCount, casesByStatus, casesByMonth, casesByLawyer, upcomingHearings] = await Promise.all([
      db.query('SELECT COUNT(*) FROM cases'),
      db.query('SELECT COUNT(*) FROM lawyers'),
      db.query('SELECT COUNT(*) FROM clients'),
      db.query("SELECT COUNT(*) FROM hearings WHERE hearing_date >= NOW()"),
      db.query("SELECT status, COUNT(*) as count FROM cases GROUP BY status"),
      db.query(`
        SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') as month, COUNT(*) as count
        FROM cases WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `),
      db.query(`
        SELECT u.name as lawyer_name, COUNT(c.id) as count
        FROM lawyers l JOIN users u ON l.user_id = u.id
        LEFT JOIN cases c ON c.lawyer_id = l.id
        GROUP BY u.name ORDER BY count DESC
      `),
      db.query(`
        SELECT h.*, c.case_title, c.case_number
        FROM hearings h JOIN cases c ON h.case_id = c.id
        WHERE h.hearing_date >= NOW() ORDER BY h.hearing_date LIMIT 5
      `),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalCases: parseInt(totalCases.rows[0].count),
        totalLawyers: parseInt(totalLawyers.rows[0].count),
        totalClients: parseInt(totalClients.rows[0].count),
        upcomingHearingsCount: parseInt(upcomingHearingsCount.rows[0].count),
        casesByStatus: casesByStatus.rows,
        casesByMonth: casesByMonth.rows,
        casesByLawyer: casesByLawyer.rows,
        upcomingHearings: upcomingHearings.rows,
      },
    });
  } catch (err) { next(err); }
};

exports.globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ status: 'success', data: { clients: [], cases: [], lawyers: [] } });
    }

    if (db.getIsMock()) {
      const term = q.toLowerCase().trim();
      const clients = inMemoryDb.clients.filter(c =>
        c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)
      ).slice(0, 5);
      const cases = inMemoryDb.cases.filter(c =>
        c.case_title.toLowerCase().includes(term) || c.case_number.toLowerCase().includes(term)
      ).slice(0, 5);
      const lawyerResults = inMemoryDb.lawyers.filter(l => {
        const user = inMemoryDb.users.find(u => u.id === l.user_id);
        return user?.name.toLowerCase().includes(term);
      }).map(l => {
        const user = inMemoryDb.users.find(u => u.id === l.user_id);
        return { ...l, name: user?.name };
      }).slice(0, 5);
      return res.status(200).json({ status: 'success', data: { clients, cases, lawyers: lawyerResults } });
    }

    const [clients, cases, lawyers] = await Promise.all([
      db.query(`SELECT id, name, email, phone FROM clients WHERE name ILIKE $1 OR email ILIKE $1 LIMIT 5`, [`%${q}%`]),
      db.query(`SELECT id, case_title, case_number, status FROM cases WHERE case_title ILIKE $1 OR case_number ILIKE $1 LIMIT 5`, [`%${q}%`]),
      db.query(`SELECT l.id, u.name, u.email, l.specialization FROM lawyers l JOIN users u ON l.user_id = u.id WHERE u.name ILIKE $1 LIMIT 5`, [`%${q}%`]),
    ]);

    res.status(200).json({
      status: 'success',
      data: { clients: clients.rows, cases: cases.rows, lawyers: lawyers.rows },
    });
  } catch (err) { next(err); }
};
