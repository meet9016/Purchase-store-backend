const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', syncController.getSyncState);
router.post('/', syncController.saveSyncState);

module.exports = router;
