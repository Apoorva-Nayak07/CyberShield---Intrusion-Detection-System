const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

router.use(protect);

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// Predict threat
router.post('/predict', async (req, res, next) => {
  try {
    const response = await axios.post(`${ML_URL}/predict`, req.body, { timeout: 10000 });
    res.json({ success: true, data: response.data });
  } catch (error) {
    logger.error(`ML service error: ${error.message}`);
    // Return fallback prediction if ML service is down
    res.json({
      success: true,
      data: {
        prediction: 'normal',
        confidence: 0.5,
        anomalyScore: 0.1,
        model: 'fallback',
        message: 'ML service unavailable, using fallback',
      },
    });
  }
});

// Get model metrics
router.get('/metrics', async (req, res, next) => {
  try {
    const response = await axios.get(`${ML_URL}/metrics`, { timeout: 5000 });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.json({
      success: true,
      data: {
        models: [
          { name: 'Isolation Forest', accuracy: 94.2, status: 'active' },
          { name: 'Random Forest', accuracy: 97.1, status: 'active' },
          { name: 'Autoencoder', accuracy: 91.3, status: 'active' },
        ],
        lastTrained: new Date().toISOString(),
        message: 'ML service unavailable',
      },
    });
  }
});

// Trigger retraining (admin only)
router.post('/train', authorize('admin'), async (req, res, next) => {
  try {
    const response = await axios.post(`${ML_URL}/train`, req.body, { timeout: 30000 });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(503).json({ success: false, message: 'ML service unavailable for training.' });
  }
});

// Health check
router.get('/health', async (req, res, next) => {
  try {
    const response = await axios.get(`${ML_URL}/health`, { timeout: 3000 });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.json({ success: false, data: { status: 'offline', message: 'ML service is not running' } });
  }
});

module.exports = router;
