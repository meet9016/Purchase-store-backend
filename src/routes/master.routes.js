const express = require('express');
const router = express.Router();
const masters = require('../controllers/masters.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// Projects
router.get('/projects', masters.projects.getAll);
router.get('/projects/:id', masters.projects.getById);
router.post('/projects', masters.projects.create);
router.put('/projects/:id', masters.projects.update);
router.delete('/projects/:id', masters.projects.remove);

// Vendors
router.get('/vendors', masters.vendors.getAll);
router.get('/vendors/:id', masters.vendors.getById);
router.post('/vendors', masters.vendors.create);
router.put('/vendors/:id', masters.vendors.update);
router.delete('/vendors/:id', masters.vendors.remove);

// Categories
router.get('/categories', masters.categories.getAll);
router.get('/categories/:id', masters.categories.getById);
router.post('/categories', masters.categories.create);
router.put('/categories/:id', masters.categories.update);
router.delete('/categories/:id', masters.categories.remove);

// Items
router.get('/items', masters.items.getAll);
router.get('/items/:id', masters.items.getById);
router.post('/items', masters.items.create);
router.put('/items/:id', masters.items.update);
router.delete('/items/:id', masters.items.remove);

module.exports = router;
