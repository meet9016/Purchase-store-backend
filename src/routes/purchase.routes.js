const express = require('express');
const router = express.Router();
const purchase = require('../controllers/purchase.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// Purchase Requests
router.get('/purchase-requests', purchase.getAllPRs);
router.post('/purchase-requests', purchase.createPR);
router.put('/purchase-requests/:id', purchase.updatePR);
router.delete('/purchase-requests/:id', purchase.deletePR);

// Purchase Orders
router.get('/purchase-orders', purchase.getAllPOs);
router.post('/purchase-orders', purchase.createPO);
router.put('/purchase-orders/:id', purchase.updatePO);
router.delete('/purchase-orders/:id', purchase.deletePO);

// Goods Receipt Notes (GRN)
router.get('/grns', purchase.getAllGRNs);
router.post('/grns', purchase.createGRN);
router.put('/grns/:id', purchase.updateGRN);
router.delete('/grns/:id', purchase.deleteGRN);

module.exports = router;
