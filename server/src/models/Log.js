const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['debug', 'info', 'warn', 'error', 'critical'],
    required: true,
    default: 'info',
  },
  category: {
    type: String,
    enum: ['auth', 'threat', 'network', 'system', 'user', 'api', 'ml', 'audit'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  sourceIp: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  userAgent: String,
  method: String,
  path: String,
  statusCode: Number,
  responseTime: Number,
  threatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threat',
    default: null,
  },
  sessionId: String,
  tags: [String],
}, {
  timestamps: true,
});

// Indexes for fast querying
logSchema.index({ createdAt: -1 });
logSchema.index({ level: 1, category: 1 });
logSchema.index({ sourceIp: 1 });
logSchema.index({ userId: 1 });
logSchema.index({ category: 1, createdAt: -1 });

// TTL index - auto-delete logs older than 90 days
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Log', logSchema);
