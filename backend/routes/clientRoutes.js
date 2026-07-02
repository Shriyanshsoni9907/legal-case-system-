const express = require('express');
const clientController = require('../controllers/clientController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection to all client routes
router.use(protect);

// Routes
router
  .route('/')
  .get(clientController.getClients)
  .post(clientController.createClient);

router
  .route('/:id')
  .get(clientController.getClient)
  .put(clientController.updateClient)
  .delete(restrictTo('Admin'), clientController.deleteClient);

module.exports = router;
