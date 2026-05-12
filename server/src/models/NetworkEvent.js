const mongoose = require('mongoose');

const networkEventSchema = new mongoose.Schema({
  sourceIp: { type: String, required: true },
  destinationIp: { type: String, required: true },
  sourcePort: Number,
  destinationPort: Number,
  protocol: {
    type: String,
    enum: ['TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'DNS', 'FTP', 'SSH', 'SMTP', 'OTHER'],
    default: 'TCP',
  },
  packetSize: Number,
  bytesTransferred: Number,
  duration: Number,
  flags: [String],
  status: {
    type: String,
    enum: ['normal', 'suspicious', 'malicious', 'blocked'],
    default: 'normal',
  },
  service: String,
  payload: String,
  // Computed features for ML
  features: {
    packetsPerSecond: Number,
    bytesPerSecond: Number,
    connectionDuration: Number,
    portEntropy: Number,
    ipEntropy: Number,
    burstiness: Number,
  },
  geoLocation: {
    country: String,
    countryCode: String,
    city: String,
    lat: Number,
    lon: Number,
  },
  threatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threat',
    default: null,
  },
  sensor: {
    type: String,
    default: 'primary',
  },
}, {
  timestamps: true,
});

// Indexes
networkEventSchema.index({ createdAt: -1 });
networkEventSchema.index({ sourceIp: 1, createdAt: -1 });
networkEventSchema.index({ status: 1 });
networkEventSchema.index({ protocol: 1 });

// TTL - keep network events for 30 days
networkEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('NetworkEvent', networkEventSchema);
