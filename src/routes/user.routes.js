const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/rbac.middleware');

// Protect all user routes
router.use(protect);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', authorizeRoles('Admin'), userController.createUser);
router.put('/:id', authorizeRoles('Admin'), userController.updateUser);
router.delete('/:id', authorizeRoles('Admin'), userController.deleteUser);

module.exports = router;
