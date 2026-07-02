const Case = require('../models/caseModel');
const AppError = require('../utils/appError');

exports.getCases = async (req, res, next) => {
  try {
    const { status, lawyerId, clientId, court, q: search, dateFrom, dateTo } = req.query;
    // If logged-in user is a lawyer, only show their cases
    let filterLawyerId = lawyerId;
    if (req.user.role === 'Lawyer') {
      const Lawyer = require('../models/lawyerModel');
      const lawyerProfile = await Lawyer.findByUserId(req.user.id);
      filterLawyerId = lawyerProfile ? lawyerProfile.id : 'none';
    }
    const cases = await Case.findAll({ status, lawyerId: filterLawyerId, clientId, court, search, dateFrom, dateTo });
    res.status(200).json({ status: 'success', results: cases.length, data: { cases } });
  } catch (err) { next(err); }
};

exports.getCase = async (req, res, next) => {
  try {
    const caseRecord = await Case.findById(req.params.id);
    if (!caseRecord) return next(new AppError('No case found with that ID.', 404));
    res.status(200).json({ status: 'success', data: { case: caseRecord } });
  } catch (err) { next(err); }
};

exports.createCase = async (req, res, next) => {
  try {
    const { caseTitle, caseNumber, caseType, court, status, filingDate, hearingDate, clientId, lawyerId, description } = req.body;
    if (!caseTitle || !caseNumber || !caseType || !court || !filingDate || !clientId) {
      return next(new AppError('Please provide: caseTitle, caseNumber, caseType, court, filingDate, clientId.', 400));
    }
    const newCase = await Case.create({ caseTitle, caseNumber, caseType, court, status, filingDate, hearingDate, clientId, lawyerId, description });
    res.status(201).json({ status: 'success', data: { case: newCase } });
  } catch (err) { next(err); }
};

exports.updateCase = async (req, res, next) => {
  try {
    const { caseTitle, caseNumber, caseType, court, status, filingDate, hearingDate, clientId, lawyerId, description } = req.body;
    // Lawyers can only update status
    if (req.user.role === 'Lawyer') {
      if (Object.keys(req.body).some(k => !['status'].includes(k))) {
        return next(new AppError('Lawyers may only update case status.', 403));
      }
    }
    const updated = await Case.update(req.params.id, { caseTitle, caseNumber, caseType, court, status, filingDate, hearingDate, clientId, lawyerId, description });
    if (!updated) return next(new AppError('No case found with that ID.', 404));
    res.status(200).json({ status: 'success', data: { case: updated } });
  } catch (err) { next(err); }
};

exports.deleteCase = async (req, res, next) => {
  try {
    const deleted = await Case.delete(req.params.id);
    if (!deleted) return next(new AppError('No case found with that ID.', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
