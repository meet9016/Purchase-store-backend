const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const syncRoutes = require('./sync.routes');

const masters = require('../controllers/masters.controller');
const purchase = require('../controllers/purchase.controller');
const store = require('../controllers/store.controller');
const finance = require('../controllers/finance.controller');
const system = require('../controllers/system.controller');
const { protect } = require('../middleware/auth.middleware');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Purchase Store Backend API is healthy' });
});

// Authentication routes
router.use('/auth', authRoutes);

// Staff User management routes
router.use('/users', userRoutes);

// Product routes
router.use('/products', productRoutes);

// Database Sync routes (bulk sync)
router.use('/sync', syncRoutes);

// ─── MASTERS ──────────────────────────────────────────────────────────────────
router.use(protect);

router.get('/projects', masters.projects.getAll);
router.get('/projects/:id', masters.projects.getById);
router.post('/projects', masters.projects.create);
router.put('/projects/:id', masters.projects.update);
router.delete('/projects/:id', masters.projects.remove);

router.get('/vendors', masters.vendors.getAll);
router.get('/vendors/:id', masters.vendors.getById);
router.post('/vendors', masters.vendors.create);
router.put('/vendors/:id', masters.vendors.update);
router.delete('/vendors/:id', masters.vendors.remove);

router.get('/categories', masters.categories.getAll);
router.get('/categories/:id', masters.categories.getById);
router.post('/categories', masters.categories.create);
router.put('/categories/:id', masters.categories.update);
router.delete('/categories/:id', masters.categories.remove);

router.get('/items', masters.items.getAll);
router.get('/items/:id', masters.items.getById);
router.post('/items', masters.items.create);
router.put('/items/:id', masters.items.update);
router.delete('/items/:id', masters.items.remove);

// ─── PURCHASE ─────────────────────────────────────────────────────────────────
router.get('/purchase-requests', purchase.getAllPRs);
router.post('/purchase-requests', purchase.createPR);
router.put('/purchase-requests/:id', purchase.updatePR);
router.delete('/purchase-requests/:id', purchase.deletePR);

router.get('/purchase-orders', purchase.getAllPOs);
router.post('/purchase-orders', purchase.createPO);
router.put('/purchase-orders/:id', purchase.updatePO);
router.delete('/purchase-orders/:id', purchase.deletePO);

router.get('/grns', purchase.getAllGRNs);
router.post('/grns', purchase.createGRN);
router.put('/grns/:id', purchase.updateGRN);
router.delete('/grns/:id', purchase.deleteGRN);

// ─── STORE ────────────────────────────────────────────────────────────────────
router.get('/stock', store.getAllStock);
router.put('/stock/:id', store.updateStock);
router.get('/stock-transactions', store.getAllStockTransactions);

router.get('/store-outwards', store.getAllOutwards);
router.post('/store-outwards', store.createOutward);
router.put('/store-outwards/:id', store.updateOutward);
router.delete('/store-outwards/:id', store.deleteOutward);

// ─── FINANCE ──────────────────────────────────────────────────────────────────
router.get('/vendor-bills', finance.getAllBills);
router.post('/vendor-bills', finance.createBill);
router.put('/vendor-bills/:id', finance.updateBill);
router.delete('/vendor-bills/:id', finance.deleteBill);

router.get('/payment-requests', finance.getAllPaymentReqs);
router.post('/payment-requests', finance.createPaymentReq);
router.put('/payment-requests/:id', finance.updatePaymentReq);
router.delete('/payment-requests/:id', finance.deletePaymentReq);

router.get('/payment-entries', finance.getAllPaymentEntries);
router.post('/payment-entries', finance.createPaymentEntry);
router.put('/payment-entries/:id', finance.updatePaymentEntry);
router.delete('/payment-entries/:id', finance.deletePaymentEntry);

// ─── SYSTEM ───────────────────────────────────────────────────────────────────
router.get('/audit-logs', system.getAllAuditLogs);
router.post('/audit-logs', system.createAuditLog);

router.get('/notifications', system.getAllNotifications);
router.post('/notifications', system.createNotification);
router.put('/notifications/:id/read', system.markNotificationRead);
router.delete('/notifications/:id', system.deleteNotification);

router.get('/role-permissions', system.getAllRolePermissions);
router.put('/role-permissions/:role', system.updateRolePermission);
router.delete('/role-permissions/:role', system.deleteRolePermission);

module.exports = router;
