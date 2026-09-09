const express = require('express');
const router = express.Router();
const system = require('../controllers/system.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

router.use(protect);

// Audit Logs
router.get('/audit-logs', system.getAllAuditLogs);
router.post('/audit-logs', system.createAuditLog);

// Notifications
router.get('/notifications', system.getAllNotifications);
router.post('/notifications', system.createNotification);
router.put('/notifications/:id/read', system.markNotificationRead);
router.delete('/notifications/:id', system.deleteNotification);

// Role Permissions
router.get('/role-permissions', system.getAllRolePermissions);
router.put('/role-permissions/:role', authorizeRoles('Admin'), system.updateRolePermission);
router.delete('/role-permissions/:role', authorizeRoles('Admin'), system.deleteRolePermission);

module.exports = router;
