const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Auth Endpoints
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
