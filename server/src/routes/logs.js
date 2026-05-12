const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Log = require('../models/Log');

router.use(protect);

// Get logs
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, level, category, search, startDate, endDate } = req.query;
    const query = {};
    if (level) query.level = level;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { sourceIp: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      Log.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('userId', 'name email').lean(),
      Log.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
});

// Export logs as CSV
router.get('/export', authorize('admin', 'analyst'), async (req, res, next) => {
  try {
    const { startDate, endDate, level, category } = req.query;
    const query = {};
    if (level) query.level = level;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await Log.find(query).sort({ createdAt: -1 }).limit(10000).lean();

    const csvHeader = 'Timestamp,Level,Category,Message,Source IP,User\n';
    const csvRows = logs.map((log) =>
      `"${log.createdAt}","${log.level}","${log.category}","${log.message?.replace(/"/g, '""')}","${log.sourceIp || ''}","${log.userId || ''}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="cybershield-logs-${Date.now()}.csv"`);
    res.send(csvHeader + csvRows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
