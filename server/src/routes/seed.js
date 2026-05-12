/**
 * Seed route - only available in development
 * POST /api/seed  →  seeds the database with demo data
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Threat = require('../models/Threat');
const Alert = require('../models/Alert');
const Log = require('../models/Log');
const NetworkEvent = require('../models/NetworkEvent');

const threatTypes = ['port_scan', 'brute_force', 'sql_injection', 'ddos', 'malware', 'suspicious_login', 'traffic_spike', 'unauthorized_access', 'xss', 'anomaly'];
const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'SSH', 'DNS', 'FTP'];
const countries = [
  { country: 'China', countryCode: 'CN', lat: 35.86, lon: 104.19 },
  { country: 'Russia', countryCode: 'RU', lat: 61.52, lon: 105.31 },
  { country: 'United States', countryCode: 'US', lat: 37.09, lon: -95.71 },
  { country: 'Brazil', countryCode: 'BR', lat: -14.23, lon: -51.92 },
  { country: 'India', countryCode: 'IN', lat: 20.59, lon: 78.96 },
  { country: 'Germany', countryCode: 'DE', lat: 51.16, lon: 10.45 },
  { country: 'North Korea', countryCode: 'KP', lat: 40.33, lon: 127.51 },
  { country: 'Iran', countryCode: 'IR', lat: 32.42, lon: 53.68 },
];

function rIp() { return `${ri(255)}.${ri(255)}.${ri(255)}.${ri(255)}`; }
function ri(max) { return Math.floor(Math.random() * max); }
function rItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rDate(d = 30) { return new Date(Date.now() - Math.random() * d * 86400000); }

router.post('/', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Seeding not allowed in production.' });
  }

  try {
    // Clear
    await Promise.all([User.deleteMany({}), Threat.deleteMany({}), Alert.deleteMany({}), Log.deleteMany({}), NetworkEvent.deleteMany({})]);

    // Users
    await User.create([
      { name: 'Admin User', email: 'admin@cybershield.io', password: 'Admin@123', role: 'admin', isActive: true, isEmailVerified: true, lastLogin: new Date() },
      { name: 'Sarah Chen', email: 'analyst@cybershield.io', password: 'Analyst@123', role: 'analyst', isActive: true, isEmailVerified: true },
      { name: 'John Viewer', email: 'viewer@cybershield.io', password: 'Viewer@123', role: 'viewer', isActive: true, isEmailVerified: true },
      { name: 'Marcus Rodriguez', email: 'marcus@cybershield.io', password: 'Analyst@123', role: 'analyst', isActive: true, isEmailVerified: true },
    ]);

    const descriptions = {
      port_scan: 'Systematic port scanning detected from external IP',
      brute_force: 'Multiple failed authentication attempts detected',
      sql_injection: 'SQL injection payload detected in HTTP request',
      ddos: 'Distributed denial of service attack detected',
      malware: 'Malware signature detected in network traffic',
      suspicious_login: 'Login attempt from unusual geographic location',
      traffic_spike: 'Abnormal traffic spike detected',
      unauthorized_access: 'Unauthorized access attempt to restricted resource',
      xss: 'Cross-site scripting payload detected',
      anomaly: 'ML model detected anomalous network behavior',
    };

    // Threats
    const threats = [];
    for (let i = 0; i < 200; i++) {
      const type = rItem(threatTypes);
      const severity = i < 20 ? 'critical' : i < 60 ? 'high' : i < 120 ? 'medium' : 'low';
      const geo = rItem(countries);
      const createdAt = rDate(30);
      threats.push({
        type, severity,
        status: Math.random() > 0.4 ? 'active' : Math.random() > 0.5 ? 'resolved' : 'investigating',
        sourceIp: rIp(),
        destinationIp: `192.168.${ri(10)}.${ri(255)}`,
        sourcePort: ri(60000) + 1024,
        destinationPort: rItem([80, 443, 22, 3306, 8080, 21, 25, 53, 3389]),
        protocol: rItem(protocols),
        description: descriptions[type],
        geoLocation: { ...geo },
        riskScore: severity === 'critical' ? ri(10) + 90 : severity === 'high' ? ri(20) + 70 : ri(30) + 40,
        detectedBy: Math.random() > 0.5 ? 'rule_engine' : 'ml_model',
        aiPrediction: { model: rItem(['Isolation Forest', 'Random Forest', 'Autoencoder']), confidence: Math.random() * 0.3 + 0.7, anomalyScore: Math.random() },
        packetData: { size: ri(1500) + 64, count: ri(1000) + 1 },
        createdAt, updatedAt: createdAt,
      });
    }
    const createdThreats = await Threat.insertMany(threats);

    // Alerts
    const alertThreats = createdThreats.filter((t) => ['critical', 'high'].includes(t.severity));
    const alerts = alertThreats.slice(0, 50).map((threat) => ({
      threat: threat._id,
      title: `${threat.severity.toUpperCase()}: ${threat.type.replace(/_/g, ' ').toUpperCase()} Detected`,
      message: descriptions[threat.type],
      severity: threat.severity,
      status: Math.random() > 0.5 ? 'new' : Math.random() > 0.5 ? 'acknowledged' : 'resolved',
      sourceIp: threat.sourceIp,
      category: 'intrusion',
      priority: threat.severity === 'critical' ? 1 : 2,
      isRead: Math.random() > 0.4,
      createdAt: threat.createdAt,
    }));
    await Alert.insertMany(alerts);

    // Network events
    const netEvents = [];
    for (let i = 0; i < 300; i++) {
      netEvents.push({
        sourceIp: rIp(), destinationIp: `10.0.${ri(10)}.${ri(255)}`,
        sourcePort: ri(60000) + 1024, destinationPort: rItem([80, 443, 22, 3306, 8080, 53]),
        protocol: rItem(protocols), packetSize: ri(1500) + 64, bytesTransferred: ri(100000),
        status: Math.random() > 0.85 ? 'suspicious' : Math.random() > 0.95 ? 'malicious' : 'normal',
        createdAt: rDate(7),
      });
    }
    await NetworkEvent.insertMany(netEvents);

    // Logs
    const logTemplates = [
      { level: 'info', category: 'auth', message: 'User logged in successfully' },
      { level: 'warn', category: 'auth', message: 'Failed login attempt' },
      { level: 'error', category: 'threat', message: 'Critical threat detected' },
      { level: 'info', category: 'system', message: 'System health check passed' },
      { level: 'warn', category: 'network', message: 'Unusual traffic pattern detected' },
      { level: 'critical', category: 'threat', message: 'DDoS attack in progress' },
    ];
    const logs = Array.from({ length: 200 }, () => ({ ...rItem(logTemplates), sourceIp: rIp(), createdAt: rDate(7) }));
    await Log.insertMany(logs);

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: 4,
        threats: createdThreats.length,
        alerts: alerts.length,
        networkEvents: netEvents.length,
        logs: logs.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
