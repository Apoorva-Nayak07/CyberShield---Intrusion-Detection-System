/**
 * Database Seeder - Creates demo data for CyberShield IDS
 * Works with local MongoDB, MongoDB Atlas, or in-memory MongoDB
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Threat = require('../models/Threat');
const Alert = require('../models/Alert');
const Log = require('../models/Log');
const NetworkEvent = require('../models/NetworkEvent');

const threatTypes = ['port_scan', 'brute_force', 'sql_injection', 'ddos', 'malware', 'suspicious_login', 'traffic_spike', 'unauthorized_access', 'xss', 'anomaly'];
const severities = ['critical', 'high', 'medium', 'low'];
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

function randomIp() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(daysBack = 30) { return new Date(Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000); }

async function connectWithFallback() {
  const localUri = 'mongodb://127.0.0.1:27017/cybershield';
  const envUri = process.env.MONGODB_URI;

  // Try explicit env URI first (Atlas etc.)
  if (envUri && envUri !== localUri) {
    try {
      await mongoose.connect(envUri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ Connected to MongoDB (env URI)');
      return;
    } catch (e) {
      console.log(`Could not connect to env URI: ${e.message}`);
    }
  }

  // Try local MongoDB
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to local MongoDB');
    return;
  } catch {
    console.log('Local MongoDB not available, starting in-memory...');
  }

  // In-memory fallback
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create({ instance: { dbName: 'cybershield' } });
  global.__mongod = mongod;
  await mongoose.connect(mongod.getUri(), { serverSelectionTimeoutMS: 10000 });
  console.log('✅ Connected to in-memory MongoDB');
  console.log('⚠️  Note: This is a separate in-memory instance from the running server.');
  console.log('   The server has its own in-memory instance with this seed data already loaded via /api/seed.');
}

async function seed() {
  try {
    await connectWithFallback();
    console.log('🗑️  Clearing existing data...');

    await Promise.all([
      User.deleteMany({}),
      Threat.deleteMany({}),
      Alert.deleteMany({}),
      Log.deleteMany({}),
      NetworkEvent.deleteMany({}),
    ]);

    // Create users
    const users = await User.create([
      { name: 'Admin User', email: 'admin@cybershield.io', password: 'Admin@123', role: 'admin', isActive: true, isEmailVerified: true, lastLogin: new Date() },
      { name: 'Sarah Chen', email: 'analyst@cybershield.io', password: 'Analyst@123', role: 'analyst', isActive: true, isEmailVerified: true },
      { name: 'John Viewer', email: 'viewer@cybershield.io', password: 'Viewer@123', role: 'viewer', isActive: true, isEmailVerified: true },
      { name: 'Marcus Rodriguez', email: 'marcus@cybershield.io', password: 'Analyst@123', role: 'analyst', isActive: true, isEmailVerified: true },
    ]);
    console.log(`👥 Created ${users.length} users`);

    // Create threats
    const threatDescriptions = {
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

    const threats = [];
    for (let i = 0; i < 200; i++) {
      const type = randomItem(threatTypes);
      const severity = i < 20 ? 'critical' : i < 60 ? 'high' : i < 120 ? 'medium' : 'low';
      const geo = randomItem(countries);
      const createdAt = randomDate(30);
      threats.push({
        type, severity,
        status: Math.random() > 0.4 ? 'active' : Math.random() > 0.5 ? 'resolved' : 'investigating',
        sourceIp: randomIp(),
        destinationIp: `192.168.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`,
        sourcePort: Math.floor(Math.random() * 60000) + 1024,
        destinationPort: randomItem([80, 443, 22, 3306, 8080, 21, 25, 53, 3389]),
        protocol: randomItem(protocols),
        description: threatDescriptions[type],
        geoLocation: { ...geo },
        riskScore: severity === 'critical' ? Math.floor(Math.random() * 10) + 90 : severity === 'high' ? Math.floor(Math.random() * 20) + 70 : Math.floor(Math.random() * 30) + 40,
        detectedBy: Math.random() > 0.5 ? 'rule_engine' : 'ml_model',
        aiPrediction: { model: randomItem(['Isolation Forest', 'Random Forest', 'Autoencoder']), confidence: Math.random() * 0.3 + 0.7, anomalyScore: Math.random() },
        packetData: { size: Math.floor(Math.random() * 1500) + 64, count: Math.floor(Math.random() * 1000) + 1 },
        createdAt, updatedAt: createdAt,
      });
    }
    const createdThreats = await Threat.insertMany(threats);
    console.log(`🚨 Created ${createdThreats.length} threats`);

    // Create alerts
    const alertThreats = createdThreats.filter((t) => ['critical', 'high'].includes(t.severity));
    const alerts = alertThreats.slice(0, 50).map((threat) => ({
      threat: threat._id,
      title: `${threat.severity.toUpperCase()}: ${threat.type.replace(/_/g, ' ').toUpperCase()} Detected`,
      message: threat.description,
      severity: threat.severity,
      status: Math.random() > 0.5 ? 'new' : Math.random() > 0.5 ? 'acknowledged' : 'resolved',
      sourceIp: threat.sourceIp,
      category: 'intrusion',
      priority: threat.severity === 'critical' ? 1 : 2,
      isRead: Math.random() > 0.4,
      createdAt: threat.createdAt,
    }));
    await Alert.insertMany(alerts);
    console.log(`🔔 Created ${alerts.length} alerts`);

    // Create network events
    const networkEvents = [];
    for (let i = 0; i < 500; i++) {
      networkEvents.push({
        sourceIp: randomIp(),
        destinationIp: `10.0.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`,
        sourcePort: Math.floor(Math.random() * 60000) + 1024,
        destinationPort: randomItem([80, 443, 22, 3306, 8080, 53]),
        protocol: randomItem(protocols),
        packetSize: Math.floor(Math.random() * 1500) + 64,
        bytesTransferred: Math.floor(Math.random() * 100000),
        status: Math.random() > 0.85 ? 'suspicious' : Math.random() > 0.95 ? 'malicious' : 'normal',
        createdAt: randomDate(7),
      });
    }
    await NetworkEvent.insertMany(networkEvents);
    console.log(`🌐 Created ${networkEvents.length} network events`);

    // Create logs
    const logMessages = [
      { level: 'info', category: 'auth', message: 'User logged in successfully' },
      { level: 'warn', category: 'auth', message: 'Failed login attempt' },
      { level: 'error', category: 'threat', message: 'Critical threat detected' },
      { level: 'info', category: 'system', message: 'System health check passed' },
      { level: 'warn', category: 'network', message: 'Unusual traffic pattern detected' },
      { level: 'critical', category: 'threat', message: 'DDoS attack in progress' },
    ];
    const logs = [];
    for (let i = 0; i < 300; i++) {
      const t = randomItem(logMessages);
      logs.push({ ...t, sourceIp: randomIp(), createdAt: randomDate(7) });
    }
    await Log.insertMany(logs);
    console.log(`📋 Created ${logs.length} logs`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:   admin@cybershield.io / Admin@123');
    console.log('  Analyst: analyst@cybershield.io / Analyst@123');
    console.log('  Viewer:  viewer@cybershield.io / Viewer@123');

    if (global.__mongod) {
      await global.__mongod.stop();
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();
