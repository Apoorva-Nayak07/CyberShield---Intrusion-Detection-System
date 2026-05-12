const NetworkEvent = require('../models/NetworkEvent');
const Threat = require('../models/Threat');
const { emitNetworkActivity, emitThreatDetected } = require('../config/socket');
const geoip = require('geoip-lite');
const logger = require('../config/logger');

// Threat detection rules
const DETECTION_RULES = {
  portScan: {
    threshold: 20,
    window: 60000, // 1 minute
    severity: 'high',
    type: 'port_scan',
  },
  bruteForce: {
    threshold: 10,
    window: 60000,
    severity: 'high',
    type: 'brute_force',
  },
  ddos: {
    threshold: 1000,
    window: 10000, // 10 seconds
    severity: 'critical',
    type: 'ddos',
  },
};

// In-memory tracking for real-time detection
const ipTracker = new Map();

// @desc    Get network events
// @route   GET /api/network/events
// @access  Private
exports.getNetworkEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, protocol, sourceIp } = req.query;

    const query = {};
    if (status) query.status = status;
    if (protocol) query.protocol = protocol;
    if (sourceIp) query.sourceIp = sourceIp;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      NetworkEvent.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      NetworkEvent.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ingest network event (from sensor/simulator)
// @route   POST /api/network/ingest
// @access  Private
exports.ingestEvent = async (req, res, next) => {
  try {
    const eventData = req.body;

    // Enrich with geo-location
    if (eventData.sourceIp) {
      const geo = geoip.lookup(eventData.sourceIp);
      if (geo) {
        eventData.geoLocation = {
          country: geo.country,
          countryCode: geo.country,
          city: geo.city,
          lat: geo.ll?.[0],
          lon: geo.ll?.[1],
        };
      }
    }

    const event = await NetworkEvent.create(eventData);

    // Run detection rules
    await runDetectionRules(event, req.app.get('io'));

    // Emit to connected clients
    try {
      emitNetworkActivity(event);
    } catch (e) {
      // Socket not available
    }

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live network stats
// @route   GET /api/network/stats
// @access  Private
exports.getNetworkStats = async (req, res, next) => {
  try {
    const last5min = new Date(Date.now() - 5 * 60 * 1000);
    const last1h = new Date(Date.now() - 60 * 60 * 1000);

    const [
      eventsLast5min,
      eventsLast1h,
      byProtocol,
      byStatus,
      topSources,
      trafficTrend,
    ] = await Promise.all([
      NetworkEvent.countDocuments({ createdAt: { $gte: last5min } }),
      NetworkEvent.countDocuments({ createdAt: { $gte: last1h } }),
      NetworkEvent.aggregate([
        { $match: { createdAt: { $gte: last1h } } },
        { $group: { _id: '$protocol', count: { $sum: 1 } } },
      ]),
      NetworkEvent.aggregate([
        { $match: { createdAt: { $gte: last1h } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      NetworkEvent.aggregate([
        { $match: { createdAt: { $gte: last1h } } },
        { $group: { _id: '$sourceIp', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      NetworkEvent.aggregate([
        { $match: { createdAt: { $gte: last1h } } },
        {
          $group: {
            _id: { $minute: '$createdAt' },
            count: { $sum: 1 },
            bytes: { $sum: '$bytesTransferred' },
          },
        },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        eventsLast5min,
        eventsLast1h,
        byProtocol: byProtocol.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        topSources: topSources.map((item) => ({ ip: item._id, count: item.count })),
        trafficTrend: trafficTrend.map((item) => ({
          minute: item._id,
          count: item.count,
          bytes: item.bytes || 0,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate attack (for demo)
// @route   POST /api/network/simulate
// @access  Private (Admin)
exports.simulateAttack = async (req, res, next) => {
  try {
    const { attackType = 'port_scan' } = req.body;
    const io = req.app.get('io');

    const attacks = {
      port_scan: generatePortScanEvents,
      brute_force: generateBruteForceEvents,
      ddos: generateDDoSEvents,
      sql_injection: generateSQLInjectionEvent,
    };

    const generator = attacks[attackType] || generatePortScanEvents;
    const events = await generator(io);

    res.json({
      success: true,
      message: `Simulated ${attackType} attack with ${events.length} events`,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// Detection rules engine
async function runDetectionRules(event, io) {
  const ip = event.sourceIp;
  const now = Date.now();

  if (!ipTracker.has(ip)) {
    ipTracker.set(ip, { ports: new Set(), timestamps: [], loginAttempts: 0 });
  }

  const tracker = ipTracker.get(ip);
  tracker.timestamps.push(now);

  // Clean old timestamps (older than 1 minute)
  tracker.timestamps = tracker.timestamps.filter((t) => now - t < 60000);

  // Port scan detection
  if (event.destinationPort) {
    tracker.ports.add(event.destinationPort);
    if (tracker.ports.size > DETECTION_RULES.portScan.threshold) {
      await createThreatFromRule('port_scan', ip, event, 'high', `Port scan detected: ${tracker.ports.size} ports scanned`);
      tracker.ports.clear();
    }
  }

  // DDoS detection
  if (tracker.timestamps.length > DETECTION_RULES.ddos.threshold) {
    await createThreatFromRule('ddos', ip, event, 'critical', `DDoS attack detected: ${tracker.timestamps.length} requests/min`);
    tracker.timestamps = [];
  }

  // Brute force (SSH/FTP ports)
  if ([22, 21, 3389, 5900].includes(event.destinationPort)) {
    tracker.loginAttempts = (tracker.loginAttempts || 0) + 1;
    if (tracker.loginAttempts > DETECTION_RULES.bruteForce.threshold) {
      await createThreatFromRule('brute_force', ip, event, 'high', `Brute force attack on port ${event.destinationPort}`);
      tracker.loginAttempts = 0;
    }
  }

  // SQL injection detection in payload
  if (event.payload) {
    const sqlPatterns = /(\bSELECT\b|\bUNION\b|\bDROP\b|\bINSERT\b|\bDELETE\b|--|\/\*|\bOR\b.*=.*\bOR\b)/i;
    if (sqlPatterns.test(event.payload)) {
      await createThreatFromRule('sql_injection', ip, event, 'critical', 'SQL injection pattern detected in payload');
    }
  }
}

async function createThreatFromRule(type, sourceIp, event, severity, description) {
  try {
    const geo = geoip.lookup(sourceIp);
    const threat = await Threat.create({
      type,
      severity,
      sourceIp,
      destinationIp: event.destinationIp,
      sourcePort: event.sourcePort,
      destinationPort: event.destinationPort,
      protocol: event.protocol,
      description,
      detectedBy: 'rule_engine',
      riskScore: severity === 'critical' ? 90 : severity === 'high' ? 70 : 50,
      geoLocation: geo ? {
        country: geo.country,
        countryCode: geo.country,
        city: geo.city,
        lat: geo.ll?.[0],
        lon: geo.ll?.[1],
      } : undefined,
    });

    try {
      emitThreatDetected(threat);
    } catch (e) {}

    return threat;
  } catch (error) {
    logger.error(`Error creating threat from rule: ${error.message}`);
  }
}

// Attack simulators
async function generatePortScanEvents(io) {
  const sourceIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const events = [];

  for (let port = 1; port <= 25; port++) {
    const event = await NetworkEvent.create({
      sourceIp,
      destinationIp: '192.168.1.1',
      sourcePort: Math.floor(Math.random() * 60000) + 1024,
      destinationPort: port * 100,
      protocol: 'TCP',
      packetSize: 64,
      status: 'suspicious',
    });
    events.push(event);
  }

  return events;
}

async function generateBruteForceEvents(io) {
  const sourceIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const events = [];

  for (let i = 0; i < 15; i++) {
    const event = await NetworkEvent.create({
      sourceIp,
      destinationIp: '192.168.1.10',
      sourcePort: Math.floor(Math.random() * 60000) + 1024,
      destinationPort: 22,
      protocol: 'SSH',
      packetSize: 128,
      status: 'suspicious',
    });
    events.push(event);
  }

  return events;
}

async function generateDDoSEvents(io) {
  const events = [];
  for (let i = 0; i < 20; i++) {
    const sourceIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const event = await NetworkEvent.create({
      sourceIp,
      destinationIp: '10.0.0.1',
      sourcePort: Math.floor(Math.random() * 60000) + 1024,
      destinationPort: 80,
      protocol: 'HTTP',
      packetSize: 1500,
      bytesTransferred: 1500,
      status: 'malicious',
    });
    events.push(event);
  }
  return events;
}

async function generateSQLInjectionEvent(io) {
  const sourceIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const event = await NetworkEvent.create({
    sourceIp,
    destinationIp: '192.168.1.100',
    sourcePort: Math.floor(Math.random() * 60000) + 1024,
    destinationPort: 3306,
    protocol: 'TCP',
    packetSize: 512,
    payload: "SELECT * FROM users WHERE id=1 OR 1=1; DROP TABLE users;--",
    status: 'malicious',
  });
  return [event];
}
