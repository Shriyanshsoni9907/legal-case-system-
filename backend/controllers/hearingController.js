const Hearing = require('../models/hearingModel');
const AppError = require('../utils/appError');

exports.getHearings = async (req, res, next) => {
  try {
    const hearings = await Hearing.findAll(req.query.caseId || null);
    res.status(200).json({ status: 'success', results: hearings.length, data: { hearings } });
  } catch (err) { next(err); }
};

exports.getUpcomingHearings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const hearings = await Hearing.findUpcoming(limit);
    res.status(200).json({ status: 'success', results: hearings.length, data: { hearings } });
  } catch (err) { next(err); }
};

exports.createHearing = async (req, res, next) => {
  try {
    const { hearingDate, court, judge, caseId, description } = req.body;
    if (!hearingDate || !court || !judge || !caseId) return next(new AppError('Provide hearingDate, court, judge, and caseId.', 400));
    const hearing = await Hearing.create({ hearingDate, court, judge, caseId, description });
    res.status(201).json({ status: 'success', data: { hearing } });
  } catch (err) { next(err); }
};

exports.updateHearing = async (req, res, next) => {
  try {
    const { hearingDate, court, judge, description } = req.body;
    const updated = await Hearing.update(req.params.id, { hearingDate, court, judge, description });
    if (!updated) return next(new AppError('No hearing found with that ID.', 404));
    res.status(200).json({ status: 'success', data: { hearing: updated } });
  } catch (err) { next(err); }
};

exports.deleteHearing = async (req, res, next) => {
  try {
    const deleted = await Hearing.delete(req.params.id);
    if (!deleted) return next(new AppError('No hearing found with that ID.', 404));
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
