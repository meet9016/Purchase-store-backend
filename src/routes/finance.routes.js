const express = require('express');
const router = express.Router();
const finance = require('../controllers/finance.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// Vendor Invoices / Bills
router.get('/vendor-bills', finance.getAllBills);
router.post('/vendor-bills', finance.createBill);
router.put('/vendor-bills/:id', finance.updateBill);
router.delete('/vendor-bills/:id', finance.deleteBill);

// Payment Requests
router.get('/payment-requests', finance.getAllPaymentReqs);
router.post('/payment-requests', finance.createPaymentReq);
router.put('/payment-requests/:id', finance.updatePaymentReq);
router.delete('/payment-requests/:id', finance.deletePaymentReq);

// Payment Entries
router.get('/payment-entries', finance.getAllPaymentEntries);
router.post('/payment-entries', finance.createPaymentEntry);
router.put('/payment-entries/:id', finance.updatePaymentEntry);
router.delete('/payment-entries/:id', finance.deletePaymentEntry);

module.exports = router;
