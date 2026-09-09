const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');
const { protect } = require('../middleware/auth.middleware');

// GET /api/sync allows initial state synchronization
router.get('/', syncController.getSyncState);

// POST /api/sync requires authenticated session to overwrite state
router.post('/', protect, syncController.saveSyncState);

module.exports = router;
