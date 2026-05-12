const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  threat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Threat',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'acknowledged', 'investigating', 'resolved', 'false_positive'],
    default: 'new',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  acknowledgedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  resolvedAt: Date,
  notes: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  notificationsSent: {
    email: { type: Boolean, default: false },
    slack: { type: Boolean, default: false },
    telegram: { type: Boolean, default: false },
  },
  sourceIp: String,
  category: {
    type: String,
    enum: ['intrusion', 'malware', 'policy_violation', 'anomaly', 'reconnaissance', 'exploitation'],
    default: 'intrusion',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
alertSchema.index({ createdAt: -1 });
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ assignedTo: 1 });
alertSchema.index({ isRead: 1 });

module.exports = mongoose.model('Alert', alertSchema);
