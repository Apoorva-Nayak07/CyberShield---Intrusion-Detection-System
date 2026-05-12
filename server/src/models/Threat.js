const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'port_scan',
      'brute_force',
      'sql_injection',
      'ddos',
      'malware',
      'suspicious_login',
      'traffic_spike',
      'unauthorized_access',
      'xss',
      'command_injection',
      'data_exfiltration',
      'ransomware',
      'phishing',
      'man_in_the_middle',
      'zero_day',
      'anomaly',
      'unknown',
    ],
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['active', 'investigating', 'resolved', 'false_positive'],
    default: 'active',
  },
  sourceIp: {
    type: String,
    required: true,
  },
  destinationIp: {
    type: String,
    default: null,
  },
  sourcePort: Number,
  destinationPort: Number,
  protocol: {
    type: String,
    enum: ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'DNS', 'FTP', 'SSH', 'SMTP', 'OTHER'],
    default: 'TCP',
  },
  description: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  // Geo-location data
  geoLocation: {
    country: String,
    countryCode: String,
    city: String,
    region: String,
    lat: Number,
    lon: Number,
    isp: String,
  },
  // AI/ML prediction data
  aiPrediction: {
    model: String,
    confidence: Number,
    anomalyScore: Number,
    features: mongoose.Schema.Types.Mixed,
  },
  // Packet data
  packetData: {
    size: Number,
    count: Number,
    duration: Number,
    bytesPerSecond: Number,
    packetsPerSecond: Number,
  },
  // Attack signatures matched
  signatures: [String],
  // Related threats
  relatedThreats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Threat' }],
  // Risk score (0-100)
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  // Analyst notes
  notes: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  detectedBy: {
    type: String,
    enum: ['rule_engine', 'ml_model', 'manual', 'signature'],
    default: 'rule_engine',
  },
  // Tags for categorization
  tags: [String],
  // MITRE ATT&CK mapping
  mitreAttack: {
    tactic: String,
    technique: String,
    techniqueId: String,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
threatSchema.index({ createdAt: -1 });
threatSchema.index({ severity: 1, status: 1 });
threatSchema.index({ sourceIp: 1 });
threatSchema.index({ type: 1 });
threatSchema.index({ 'geoLocation.countryCode': 1 });

// Virtual: age in minutes
threatSchema.virtual('ageMinutes').get(function () {
  return Math.floor((Date.now() - this.createdAt) / 60000);
});

module.exports = mongoose.model('Threat', threatSchema);
