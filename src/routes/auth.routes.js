const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateLogin, validateRegister, validateChangePassword } = require('../middleware/validator.middleware');

// Public Auth Endpoints
router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);

// Protected Auth Endpoints
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, validateChangePassword, authController.changePassword);
router.post('/logout', protect, authController.logout);

module.exports = router;

