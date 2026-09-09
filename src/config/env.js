require('dotenv').config();

const config = {
  PORT: process.env.PORT || 5005,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/purchase_store',
  JWT_SECRET: process.env.JWT_SECRET || 'purchase_store_enterprise_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};

module.exports = config;
