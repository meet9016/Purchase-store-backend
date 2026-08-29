const express = require('express');
const router = express.Router();

const productRoutes = require('./product.routes');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Product routes
router.use('/products', productRoutes);

module.exports = router;
