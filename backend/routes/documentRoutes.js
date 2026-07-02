const express = require('express');
const documentController = require('../controllers/documentController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router({ mergeParams: true }); // mergeParams gives access to :caseId

router.use(protect);
router.route('/').get(documentController.getDocuments).post(upload.single('document'), documentController.uploadDocument);
router.route('/:docId').get(documentController.downloadDocument).delete(documentController.deleteDocument);

module.exports = router;
