const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
    socket.join(`role:${socket.userRole}`);

    // Handle client events
    socket.on('subscribe:threats', () => {
      socket.join('threats');
      logger.debug(`Socket ${socket.id} subscribed to threats`);
    });

    socket.on('subscribe:alerts', () => {
      socket.join('alerts');
      logger.debug(`Socket ${socket.id} subscribed to alerts`);
    });

    socket.on('subscribe:network', () => {
      socket.join('network');
      logger.debug(`Socket ${socket.id} subscribed to network`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit events to clients
const emitThreatDetected = (threat) => {
  if (io) {
    io.to('threats').emit('threat:detected', threat);
    logger.debug('Emitted threat:detected event');
  }
};

const emitAlertCreated = (alert) => {
  if (io) {
    io.to('alerts').emit('alert:created', alert);
    logger.debug('Emitted alert:created event');
  }
};

const emitNetworkActivity = (activity) => {
  if (io) {
    io.to('network').emit('network:activity', activity);
  }
};

const emitSystemStats = (stats) => {
  if (io) {
    io.emit('system:stats', stats);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitThreatDetected,
  emitAlertCreated,
  emitNetworkActivity,
  emitSystemStats,
};
