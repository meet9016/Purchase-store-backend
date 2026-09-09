const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

// Middleware to verify JWT token and attach user to request
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.unauthorized(res, 'Authentication required. Please provide a valid token.');
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return ApiResponse.unauthorized(res, 'User belonging to this token no longer exists.');
    }

    if (user.active === false) {
      return ApiResponse.forbidden(res, 'Your user account is deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, 'Invalid or expired authorization token.');
  }
};

module.exports = { protect };
