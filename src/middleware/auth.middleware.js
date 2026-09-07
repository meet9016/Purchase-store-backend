const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RolePermission = require('../models/RolePermission');

const JWT_SECRET = process.env.JWT_SECRET || 'purchase-store-super-secret-key-2026';

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.active) {
        req.user = user;
      }
    } catch (err) {
    }
    next();
  } catch (error) {
    next(error);
  }
};

exports.authorizeModule = (moduleName) => {
  return async (req, res, next) => {
    if (!req.user) return next(); 

    if (req.user.role === 'Admin') return next(); 

    const rolePerm = await RolePermission.findOne({ role: req.user.role });
    if (!rolePerm || !rolePerm.modules.includes(moduleName)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden: Role '${req.user.role}'does not have permission to access module'${moduleName}'`
      });
    }

    next();
  };
};

module.exports.JWT_SECRET = JWT_SECRET;
