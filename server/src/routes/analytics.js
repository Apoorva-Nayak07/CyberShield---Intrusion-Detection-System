const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/overview', analyticsController.getOverview);
router.get('/trends', analyticsController.getTrends);
router.get('/geo', analyticsController.getGeoData);
router.get('/ml-metrics', analyticsController.getMLMetrics);
router.get('/health', analyticsController.getSystemHealth);

module.exports = router;
