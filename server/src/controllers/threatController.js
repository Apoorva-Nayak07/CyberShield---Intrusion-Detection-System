const Threat = require('../models/Threat');
const Alert = require('../models/Alert');
const Log = require('../models/Log');
const geoip = require('geoip-lite');
const { emitThreatDetected, emitAlertCreated } = require('../config/socket');
const logger = require('../config/logger');

// @desc    Get all threats
// @route   GET /api/threats
// @access  Private
exports.getThreats = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      severity,
      status,
      type,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { sourceIp: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'geoLocation.country': { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [threats, total] = await Promise.all([
      Threat.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('notes.author', 'name email')
        .lean(),
      Threat.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: threats,
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

// @desc    Get single threat
// @route   GET /api/threats/:id
// @access  Private
exports.getThreat = async (req, res, next) => {
  try {
    const threat = await Threat.findById(req.params.id)
      .populate('notes.author', 'name email avatar')
      .populate('resolvedBy', 'name email');

    if (!threat) {
      return res.status(404).json({ success: false, message: 'Threat not found.' });
    }

    res.json({ success: true, data: threat });
  } catch (error) {
    next(error);
  }
};

// @desc    Create threat (from detection engine)
// @route   POST /api/threats
// @access  Private
exports.createThreat = async (req, res, next) => {
  try {
    const threatData = req.body;

    // Enrich with geo-location
    if (threatData.sourceIp) {
      const geo = geoip.lookup(threatData.sourceIp);
      if (geo) {
        threatData.geoLocation = {
          country: geo.country,
          countryCode: geo.country,
          city: geo.city,
          region: geo.region,
          lat: geo.ll?.[0],
          lon: geo.ll?.[1],
        };
      }
    }

    // Calculate risk score
    const severityScores = { critical: 90, high: 70, medium: 50, low: 25, info: 10 };
    threatData.riskScore = severityScores[threatData.severity] || 50;

    const threat = await Threat.create(threatData);

    // Create alert for high/critical threats
    if (['critical', 'high'].includes(threat.severity)) {
      const alert = await Alert.create({
        threat: threat._id,
        title: `${threat.severity.toUpperCase()}: ${threat.type.replace(/_/g, ' ').toUpperCase()} Detected`,
        message: threat.description,
        severity: threat.severity,
        sourceIp: threat.sourceIp,
        category: mapThreatToCategory(threat.type),
        priority: threat.severity === 'critical' ? 1 : 2,
      });

      // Emit real-time alert
      try {
        emitAlertCreated(alert);
      } catch (e) {
        logger.warn('Socket not available for alert emission');
      }
    }

    // Emit real-time threat
    try {
      emitThreatDetected(threat);
    } catch (e) {
      logger.warn('Socket not available for threat emission');
    }

    // Log the threat
    await Log.create({
      level: threat.severity === 'critical' ? 'critical' : 'warn',
      category: 'threat',
      message: `Threat detected: ${threat.type} from ${threat.sourceIp}`,
      details: { threatId: threat._id, type: threat.type, severity: threat.severity },
      sourceIp: threat.sourceIp,
      threatId: threat._id,
    });

    res.status(201).json({ success: true, data: threat });
  } catch (error) {
    next(error);
  }
};

// @desc    Update threat
// @route   PUT /api/threats/:id
// @access  Private (Analyst+)
exports.updateThreat = async (req, res, next) => {
  try {
    const threat = await Threat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!threat) {
      return res.status(404).json({ success: false, message: 'Threat not found.' });
    }

    res.json({ success: true, data: threat });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve threat
// @route   PUT /api/threats/:id/resolve
// @access  Private (Analyst+)
exports.resolveThreat = async (req, res, next) => {
  try {
    const threat = await Threat.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!threat) {
      return res.status(404).json({ success: false, message: 'Threat not found.' });
    }

    // Resolve associated alerts
    await Alert.updateMany(
      { threat: threat._id, status: { $ne: 'resolved' } },
      { status: 'resolved', resolvedBy: req.user.id, resolvedAt: new Date() }
    );

    res.json({ success: true, data: threat });
  } catch (error) {
    next(error);
  }
};

// @desc    Add note to threat
// @route   POST /api/threats/:id/notes
// @access  Private (Analyst+)
exports.addNote = async (req, res, next) => {
  try {
    const threat = await Threat.findByIdAndUpdate(
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

    if (!threat) {
      return res.status(404).json({ success: false, message: 'Threat not found.' });
    }

    res.json({ success: true, data: threat });
  } catch (error) {
    next(error);
  }
};

// @desc    Get threat statistics
// @route   GET /api/threats/stats
// @access  Private
exports.getThreatStats = async (req, res, next) => {
  try {
    const { period = '24h' } = req.query;

    const periodMap = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
    const hours = periodMap[period] || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [
      totalThreats,
      activeThreats,
      criticalThreats,
      bySeverity,
      byType,
      byStatus,
      topSourceIps,
      recentTrend,
    ] = await Promise.all([
      Threat.countDocuments({ createdAt: { $gte: since } }),
      Threat.countDocuments({ status: 'active' }),
      Threat.countDocuments({ severity: 'critical', status: 'active' }),
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
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Threat.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$sourceIp', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Threat.aggregate([
        {
          $match: { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalThreats,
        activeThreats,
        criticalThreats,
        bySeverity: bySeverity.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byType: byType.map((item) => ({ type: item._id, count: item.count })),
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        topSourceIps: topSourceIps.map((item) => ({ ip: item._id, count: item.count })),
        recentTrend: recentTrend.map((item) => ({ hour: item._id, count: item.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete threat
// @route   DELETE /api/threats/:id
// @access  Private (Admin)
exports.deleteThreat = async (req, res, next) => {
  try {
    const threat = await Threat.findByIdAndDelete(req.params.id);
    if (!threat) {
      return res.status(404).json({ success: false, message: 'Threat not found.' });
    }
    res.json({ success: true, message: 'Threat deleted.' });
  } catch (error) {
    next(error);
  }
};

// Helper: map threat type to alert category
function mapThreatToCategory(type) {
  const map = {
    port_scan: 'reconnaissance',
    brute_force: 'intrusion',
    sql_injection: 'exploitation',
    ddos: 'intrusion',
    malware: 'malware',
    suspicious_login: 'intrusion',
    traffic_spike: 'anomaly',
    unauthorized_access: 'intrusion',
    xss: 'exploitation',
    anomaly: 'anomaly',
  };
  return map[type] || 'intrusion';
}
