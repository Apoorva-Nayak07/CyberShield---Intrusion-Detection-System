const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Get settings (public to all authenticated users)
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      appName: 'CyberShield IDS',
      version: '1.0.0',
      features: {
        mlDetection: true,
        geoLocation: true,
        emailAlerts: !!process.env.SMTP_HOST,
        twoFactor: true,
      },
    },
  });
});

// Update settings (admin only)
router.put('/', authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Settings updated.' });
});

module.exports = router;
