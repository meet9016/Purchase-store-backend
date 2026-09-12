const ApiResponse = require('../utils/apiResponse');
const RolePermission = require('../models/RolePermission');

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Role (${req.user?.role || 'Guest'}) is not authorized to access this resource`
      );
    }
    next();
  };
};
const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Authentication required.');
      }
      if (req.user.role === 'Admin') {
        return next();
      }
      const rolePerm = await RolePermission.findOne({ role: req.user.role });
      if (!rolePerm || !rolePerm.permissions) {
        return ApiResponse.forbidden(res, `No permissions configured for role '${req.user.role}'`);
      }
      const modulePerms = rolePerm.permissions[moduleName];
      if (!modulePerms || !modulePerms[action]) {
        return ApiResponse.forbidden(
          res,
          `Permission denied: '${action}' on '${moduleName}' is not allowed for '${req.user.role}'`
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { authorizeRoles, checkPermission };
