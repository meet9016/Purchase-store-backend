const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const masterRoutes = require('./master.routes');
const purchaseRoutes = require('./purchase.routes');
const storeRoutes = require('./store.routes');
const financeRoutes = require('./finance.routes');
const systemRoutes = require('./system.routes');
const syncRoutes = require('./sync.routes');
const { getDbStatus } = require('../config/db');
const ApiResponse = require('../utils/apiResponse');

// Health check endpoint reporting API and DB status
router.get('/health', (req, res) => {
  const dbStatus = getDbStatus();
  return ApiResponse.success(
    res,
    {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
    'Purchase Store Backend API is healthy'
  );
});

// Modular Routes Registration
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sync', syncRoutes);

// Business Domain Routes
router.use('/', masterRoutes);
router.use('/', purchaseRoutes);
router.use('/', storeRoutes);
router.use('/', financeRoutes);
router.use('/', systemRoutes);

module.exports = router;
