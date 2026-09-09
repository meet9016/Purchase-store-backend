const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log(`⚠️ Server will continue running, retrying DB connection in 10 seconds...`);
    
    // Auto-retry connection without crashing the Express server
    setTimeout(() => {
      connectDB(retryCount + 1);
    }, 10000);
  }
};

// Database connection event listeners
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('📡 Mongoose connection established');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error(`❌ Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('⚠️ Mongoose disconnected from MongoDB');
});

const getDbStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  host: mongoose.connection.host || null,
  name: mongoose.connection.name || null,
});

module.exports = connectDB;
module.exports.getDbStatus = getDbStatus;
