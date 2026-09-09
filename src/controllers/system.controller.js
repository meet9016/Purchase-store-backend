const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const RolePermission = require('../models/RolePermission');
const ApiResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const asyncHandler = require('../utils/asyncHandler');

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
exports.getAllAuditLogs = asyncHandler(async (req, res) => {
  const searchFields = ['userName', 'userRole', 'action', 'module', 'description', 'referenceId'];
  const features = new ApiFeatures(AuditLog.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(res, data, 'Audit logs retrieved', 200, features.paginationInfo);
});

exports.createAuditLog = asyncHandler(async (req, res) => {
  const { action, module } = req.body;
  if (!action || !module) {
    return ApiResponse.badRequest(res, 'action and module are required');
  }

  const newLog = await AuditLog.create({
    id: req.body.id || `log-${Date.now()}`,
    timestamp: req.body.timestamp || new Date().toISOString(),
    ...req.body,
  });

  return ApiResponse.created(res, newLog, 'Audit log recorded');
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
exports.getAllNotifications = asyncHandler(async (req, res) => {
  const searchFields = ['title', 'message', 'type', 'recipientRole', 'recipientUser'];
  const features = new ApiFeatures(Notification.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(res, data, 'Notifications retrieved', 200, features.paginationInfo);
});

exports.createNotification = asyncHandler(async (req, res) => {
  const { recipientRole, title, message } = req.body;
  if (!title || !message) {
    return ApiResponse.badRequest(res, 'title and message are required');
  }

  const newNotif = await Notification.create({
    id: req.body.id || `notif-${Date.now()}`,
    timestamp: req.body.timestamp || new Date().toISOString(),
    read: false,
    readBy: [],
    ...req.body,
  });

  return ApiResponse.created(res, newNotif, 'Notification dispatched');
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const notif = await Notification.findOneAndUpdate(query, { $set: { read: true } }, { new: true });
  if (!notif) {
    return ApiResponse.notFound(res, 'Notification not found');
  }

  return ApiResponse.success(res, notif, 'Notification marked as read');
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const notif = await Notification.findOneAndDelete(query);
  if (!notif) {
    return ApiResponse.notFound(res, 'Notification not found');
  }

  return ApiResponse.success(res, null, 'Notification deleted successfully');
});

// ─── ROLE PERMISSIONS ─────────────────────────────────────────────────────────
exports.getAllRolePermissions = asyncHandler(async (req, res) => {
  const perms = await RolePermission.find();
  return ApiResponse.success(res, perms, 'Role permissions retrieved');
});

exports.updateRolePermission = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const updated = await RolePermission.findOneAndUpdate(
    { role },
    { ...req.body, role },
    { new: true, upsert: true, runValidators: true }
  );

  return ApiResponse.success(res, updated, `Permissions for role '${role}' updated successfully`);
});

exports.deleteRolePermission = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const result = await RolePermission.findOneAndDelete({ role });
  if (!result) {
    return ApiResponse.notFound(res, `Role '${role}' not found`);
  }

  return ApiResponse.success(res, null, `Role '${role}' permissions removed`);
});
