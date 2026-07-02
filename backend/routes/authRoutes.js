const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public auth endpoints
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected user profile endpoint
router.get('/me', protect, authController.getMe);

module.exports = router;
