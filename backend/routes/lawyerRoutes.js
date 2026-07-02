const express = require('express');
const lawyerController = require('../controllers/lawyerController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes
router
  .route('/')
  .get(lawyerController.getLawyers)
  .post(restrictTo('Admin'), lawyerController.createLawyer);

router
  .route('/:id')
  .get(lawyerController.getLawyer)
  .put(restrictTo('Admin'), lawyerController.updateLawyer)
  .delete(restrictTo('Admin'), lawyerController.deleteLawyer);

module.exports = router;
