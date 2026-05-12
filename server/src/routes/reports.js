const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Threat = require('../models/Threat');
const Alert = require('../models/Alert');

router.use(protect);
router.use(authorize('admin', 'analyst'));

// Generate report data
router.get('/generate', async (req, res, next) => {
  try {
    const { type = 'daily' } = req.query;
    const periodMap = { daily: 1, weekly: 7, monthly: 30 };
    const days = periodMap[type] || 1;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalThreats,
      resolvedThreats,
      criticalThreats,
      bySeverity,
      byType,
      topIps,
    ] = await Promise.all([
      Threat.countDocuments({ createdAt: { $gte: since } }),
      Threat.countDocuments({ createdAt: { $gte: since }, status: 'resolved' }),
      Threat.countDocuments({ createdAt: { $gte: since }, severity: 'critical' }),
      Threat.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Threat.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Threat.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$sourceIp', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        reportType: type,
        period: { from: since, to: new Date() },
        summary: {
          totalThreats,
          resolvedThreats,
          criticalThreats,
          resolutionRate: totalThreats > 0 ? Math.round((resolvedThreats / totalThreats) * 100) : 0,
        },
        bySeverity: bySeverity.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byType: byType.map((item) => ({ type: item._id, count: item.count })),
        topAttackerIps: topIps.map((item) => ({ ip: item._id, count: item.count })),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
