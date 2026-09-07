const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorizeModule } = require('../middleware/auth.middleware');

// Protect all user routes
router.use(protect);

// Staff / User Management Endpoints
router.get('/', userController.getUsers);
router.post('/', authorizeModule('masters'), userController.createUser);
router.put('/:id', authorizeModule('masters'), userController.updateUser);
router.delete('/:id', authorizeModule('masters'), userController.deleteUser);

module.exports = router;
