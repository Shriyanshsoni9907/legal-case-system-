const express = require('express');
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

router.post('/', chatController.handleChat);

module.exports = router;
