const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/events', networkController.getNetworkEvents);
router.post('/ingest', networkController.ingestEvent);
router.get('/stats', networkController.getNetworkStats);
router.post('/simulate', authorize('admin'), networkController.simulateAttack);

module.exports = router;
