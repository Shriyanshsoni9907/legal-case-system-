const express = require('express');
const hearingController = require('../controllers/hearingController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.get('/upcoming', hearingController.getUpcomingHearings);
router.route('/').get(hearingController.getHearings).post(hearingController.createHearing);
router.route('/:id').put(hearingController.updateHearing).delete(hearingController.deleteHearing);

module.exports = router;
