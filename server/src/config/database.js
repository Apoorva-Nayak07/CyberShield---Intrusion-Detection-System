const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  // If MONGODB_URI is explicitly set in .env, use it directly
  const explicitUri = process.env.MONGODB_URI;

  if (explicitUri && explicitUri !== 'mongodb://localhost:27017/cybershield') {
    // Use the provided URI (Atlas or custom)
    try {
      const conn = await mongoose.connect(explicitUri, { serverSelectionTimeoutMS: 10000 });
      logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      logger.error(`❌ MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  }

  // Try local MongoDB first
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/cybershield', {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info(`✅ MongoDB Connected (local): ${conn.connection.host}`);
    return;
  } catch {
    logger.warn('Local MongoDB not available. Starting in-memory MongoDB...');
  }

  // Fall back to in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({
      instance: { dbName: 'cybershield' },
    });
    const uri = mongod.getUri();
    global.__mongod = mongod; // Keep alive

    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    logger.info(`✅ MongoDB Connected (in-memory): ${conn.connection.host}`);
    logger.warn('⚠️  Using in-memory MongoDB — data will be lost on restart. Install MongoDB for persistence.');
  } catch (error) {
    logger.error(`❌ Could not start MongoDB: ${error.message}`);
    logger.error('Please install MongoDB: https://www.mongodb.com/try/download/community');
    logger.error('Or set MONGODB_URI in server/.env to a MongoDB Atlas connection string');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

module.exports = connectDB;
