const Alert = require('../models/Alert');
const Log = require('../models/Log');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      severity,
      status,
      search,
      unreadOnly,
    } = req.query;

    const query = {};
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (unreadOnly === 'true') query.isRead = false;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { sourceIp: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [alerts, total, unreadCount] = await Promise.all([
      Alert.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('threat', 'type sourceIp severity')
        .populate('assignedTo', 'name email')
        .populate('notes.author', 'name email')
        .lean(),
      Alert.countDocuments(query),
      Alert.countDocuments({ isRead: false }),
    ]);

    res.json({
      success: true,
      data: alerts,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private
exports.getAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    )
      .populate('threat')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('notes.author', 'name email avatar');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Acknowledge alert
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private (Analyst+)
exports.acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status: 'acknowledged',
        acknowledgedBy: req.user.id,
        acknowledgedAt: new Date(),
        isRead: true,
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private (Analyst+)
exports.resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
        isRead: true,
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Add note to alert
// @route   POST /api/alerts/:id/notes
// @access  Private (Analyst+)
exports.addNote = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          notes: {
            author: req.user.id,
            content: req.body.content,
          },
        },
      },
      { new: true }
    ).populate('notes.author', 'name email');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign alert
// @route   PUT /api/alerts/:id/assign
// @access  Private (Admin/Analyst)
exports.assignAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.userId, status: 'investigating' },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all as read
// @route   PUT /api/alerts/mark-all-read
// @access  Private
exports.markAllRead = async (req, res, next) => {
  try {
    await Alert.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All alerts marked as read.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Admin)
exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }
    res.json({ success: true, message: 'Alert deleted.' });
  } catch (error) {
    next(error);
  }
};
