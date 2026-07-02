const express = require('express');
const caseController = require('../controllers/caseController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.route('/').get(caseController.getCases).post(restrictTo('Admin'), caseController.createCase);
router.route('/:id').get(caseController.getCase).put(caseController.updateCase).delete(restrictTo('Admin'), caseController.deleteCase);

module.exports = router;
