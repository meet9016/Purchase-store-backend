const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const server = app.listen(config.PORT, () => {
  console.log(`🚀 Purchase Store Backend running on port ${config.PORT} [${config.NODE_ENV}]`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Rejection: ${err.message}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`💥 Uncaught Exception: ${err.message}`);
});

module.exports = server;
