const express = require('express');
const router = express.Router();
const finance = require('../controllers/finance.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateVendorBill, validatePaymentRequest, validatePaymentEntry } = require('../middleware/validator.middleware');

router.use(protect);

// Vendor Invoices / Bills
router.get('/vendor-bills', finance.getAllBills);
router.post('/vendor-bills', validateVendorBill, finance.createBill);
router.put('/vendor-bills/:id', finance.updateBill);
router.delete('/vendor-bills/:id', finance.deleteBill);

// Payment Requests
router.get('/payment-requests', finance.getAllPaymentReqs);
router.post('/payment-requests', validatePaymentRequest, finance.createPaymentReq);
router.put('/payment-requests/:id', finance.updatePaymentReq);
router.delete('/payment-requests/:id', finance.deletePaymentReq);

// Payment Entries
router.get('/payment-entries', finance.getAllPaymentEntries);
router.post('/payment-entries', validatePaymentEntry, finance.createPaymentEntry);
router.put('/payment-entries/:id', finance.updatePaymentEntry);
router.delete('/payment-entries/:id', finance.deletePaymentEntry);

module.exports = router;
