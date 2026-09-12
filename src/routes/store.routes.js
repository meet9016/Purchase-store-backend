const express = require('express');
const router = express.Router();
const store = require('../controllers/store.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateStoreOutward } = require('../middleware/validator.middleware');

router.use(protect);

// Stock & Inventory
router.get('/stock', store.getAllStock);
router.put('/stock/:id', store.updateStock);
router.get('/stock-transactions', store.getAllStockTransactions);

// Store Outward / Issues
router.get('/store-outwards', store.getAllOutwards);
router.post('/store-outwards', validateStoreOutward, store.createOutward);
router.put('/store-outwards/:id', store.updateOutward);
router.delete('/store-outwards/:id', store.deleteOutward);

module.exports = router;

