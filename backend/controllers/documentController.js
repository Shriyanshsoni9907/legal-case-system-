const Document = require('../models/documentModel');
const AppError = require('../utils/appError');
const path = require('path');
const fs = require('fs');

exports.getDocuments = async (req, res, next) => {
  try {
    const docs = await Document.findByCaseId(req.params.caseId);
    res.status(200).json({ status: 'success', results: docs.length, data: { documents: docs } });
  } catch (err) { next(err); }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded. Please attach a file.', 400));
    const doc = await Document.create({
      fileName: req.file.originalname,
      filePath: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      caseId: req.params.caseId,
      uploadedBy: req.user.id,
    });
    res.status(201).json({ status: 'success', data: { document: doc } });
  } catch (err) { next(err); }
};

exports.downloadDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.docId);
    if (!doc) return next(new AppError('Document not found.', 404));
    const filePath = path.join(__dirname, '../uploads', doc.file_path);
    if (!fs.existsSync(filePath)) return next(new AppError('File not found on server.', 404));
    res.download(filePath, doc.file_name);
  } catch (err) { next(err); }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.delete(req.params.docId);
    if (!doc) return next(new AppError('Document not found.', 404));
    // Remove physical file
    const filePath = path.join(__dirname, '../uploads', doc.file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};
