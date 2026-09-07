const mongoose = require('mongoose');

const col = (name) => mongoose.connection.db.collection(name);

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
exports.getAllAuditLogs = async (req, res, next) => {
  try {
    const docs = await col('auditlogs').find({}).sort({ timestamp: -1 }).limit(500).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.createAuditLog = async (req, res, next) => {
  try {
    const { userId, action, module, referenceId } = req.body;
    if (!action || !module) {
      return res.status(400).json({ status: 'error', message: 'action and module are required' });
    }
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...req.body
    };
    await col('auditlogs').insertOne(newLog);
    const { _id, ...rest } = newLog;
    res.status(201).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
exports.getAllNotifications = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) filter.recipientRole = req.query.role;
    const docs = await col('notifications').find(filter).sort({ timestamp: -1 }).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.createNotification = async (req, res, next) => {
  try {
    const { recipientRole, title, message } = req.body;
    if (!recipientRole || !title || !message) {
      return res.status(400).json({ status: 'error', message: 'recipientRole, title, and message are required' });
    }
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      readBy: [],
      read: false,
      ...req.body
    };
    await col('notifications').insertOne(newNotif);
    const { _id, ...rest } = newNotif;
    res.status(201).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await col('notifications').updateOne({ id }, { $set: { read: true } });
    res.status(200).json({ status: 'success', message: 'Notification marked as read' });
  } catch (err) { next(err); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await col('notifications').deleteOne({ id });
    res.status(200).json({ status: 'success', message: 'Notification deleted' });
  } catch (err) { next(err); }
};

// ─── ROLE PERMISSIONS ─────────────────────────────────────────────────────────
const DEFAULT_PERMISSIONS = [
  {
    role: 'Admin',
    modules: ['dashboard', 'masters', 'pr', 'po', 'grn', 'stock', 'outward', 'bills', 'payment-req', 'payments', 'reports', 'audit', 'notifications', 'permissions'],
    permissions: {
      'Leads': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'User': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Department Management': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Lead Statuses': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Lead Sources': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Category': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Product': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Stock': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'City Master': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Reports': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Purchase Requests': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Purchase Orders': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Goods Receipt (GRN)': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Store Outward': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Vendor Invoices': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Payment Requests': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Payment Entries': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
    }
  },
  {
    role: 'Requester',
    modules: ['dashboard', 'pr', 'stock', 'reports', 'notifications'],
    permissions: {
      'Purchase Requests': { viewGlobal: false, viewOwn: true, create: true, update: true, delete: false },
      'Product': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
      'Stock': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
      'Reports': { viewGlobal: false, viewOwn: true, create: false, update: false, delete: false },
    }
  },
  {
    role: 'Approver',
    modules: ['dashboard', 'pr', 'po', 'payment-req', 'reports', 'notifications'],
    permissions: {
      'Purchase Requests': { viewGlobal: true, viewOwn: true, create: false, update: true, delete: false },
      'Purchase Orders': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Payment Requests': { viewGlobal: true, viewOwn: true, create: false, update: true, delete: false },
      'Reports': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
    }
  },
  {
    role: 'Purchase',
    modules: ['dashboard', 'masters', 'pr', 'po', 'grn', 'reports', 'notifications'],
    permissions: {
      'Category': { viewGlobal: true, viewOwn: false, create: true, update: true, delete: false },
      'Product': { viewGlobal: true, viewOwn: false, create: true, update: true, delete: false },
      'Purchase Requests': { viewGlobal: true, viewOwn: false, create: false, update: true, delete: false },
      'Purchase Orders': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: true },
      'Goods Receipt (GRN)': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Reports': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
    }
  },
  {
    role: 'Store',
    modules: ['dashboard', 'grn', 'stock', 'outward', 'reports', 'notifications'],
    permissions: {
      'Product': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
      'Stock': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Goods Receipt (GRN)': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Store Outward': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Reports': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
    }
  },
  {
    role: 'Accounts',
    modules: ['dashboard', 'bills', 'payment-req', 'payments', 'reports', 'notifications'],
    permissions: {
      'Vendor Invoices': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Payment Requests': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Payment Entries': { viewGlobal: true, viewOwn: true, create: true, update: true, delete: false },
      'Reports': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
    }
  },
  {
    role: 'Management',
    modules: ['dashboard', 'reports', 'audit', 'notifications'],
    permissions: {
      'Reports': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
      'User': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
      'Purchase Orders': { viewGlobal: true, viewOwn: false, create: false, update: false, delete: false },
    }
  },
];

exports.getAllRolePermissions = async (req, res, next) => {
  try {
    let docs = await col('rolepermissions').find({}).toArray();
    if (!docs || docs.length === 0) {
      await col('rolepermissions').insertMany(DEFAULT_PERMISSIONS);
      docs = DEFAULT_PERMISSIONS;
    }
    res.status(200).json({ status: 'success', data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.updateRolePermission = async (req, res, next) => {
  try {
    const { role } = req.params;
    const { modules, permissions, newRoleName } = req.body;
    
    const targetRole = role;
    const finalRoleName = newRoleName || targetRole;

    const updateDoc = {
      role: finalRoleName,
      modules: Array.isArray(modules) ? modules : [],
      permissions: permissions || {},
    };

    await col('rolepermissions').updateOne(
      { role: targetRole },
      { $set: updateDoc },
      { upsert: true }
    );

    res.status(200).json({ status: 'success', data: updateDoc });
  } catch (err) { next(err); }
};

exports.deleteRolePermission = async (req, res, next) => {
  try {
    const { role } = req.params;
    await col('rolepermissions').deleteOne({ role });
    res.status(200).json({ status: 'success', message: `Role ${role} deleted` });
  } catch (err) { next(err); }
};
