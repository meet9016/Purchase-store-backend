const mongoose = require('mongoose');

// Helper to get collection
const col = (name) => mongoose.connection.db.collection(name);

// ─── GENERIC CRUD FACTORY ─────────────────────────────────────────────────────
function makeController(collectionName, requiredFields = []) {
  return {
    getAll: async (req, res, next) => {
      try {
        const docs = await col(collectionName).find({}).toArray();
        const data = docs.map(({ _id, ...rest }) => rest);
        res.status(200).json({ status: 'success', count: data.length, data });
      } catch (err) { next(err); }
    },

    getById: async (req, res, next) => {
      try {
        const doc = await col(collectionName).findOne({ id: req.params.id });
        if (!doc) return res.status(404).json({ status: 'error', message: 'Record not found' });
        const { _id, ...rest } = doc;
        res.status(200).json({ status: 'success', data: rest });
      } catch (err) { next(err); }
    },

    create: async (req, res, next) => {
      try {
        const body = req.body;
        for (const f of requiredFields) {
          if (!body[f]) return res.status(400).json({ status: 'error', message: `${f} is required` });
        }
        const newDoc = { id: `${collectionName.slice(0,3)}-${Date.now()}`, ...body };
        await col(collectionName).insertOne(newDoc);
        const { _id, ...rest } = newDoc;
        res.status(201).json({ status: 'success', data: rest });
      } catch (err) { next(err); }
    },

    update: async (req, res, next) => {
      try {
        const { id } = req.params;
        const existing = await col(collectionName).findOne({ id });
        if (!existing) return res.status(404).json({ status: 'error', message: 'Record not found' });
        const updated = { ...existing, ...req.body, id };
        await col(collectionName).replaceOne({ id }, updated);
        const { _id, ...rest } = updated;
        res.status(200).json({ status: 'success', data: rest });
      } catch (err) { next(err); }
    },

    remove: async (req, res, next) => {
      try {
        const { id } = req.params;
        const existing = await col(collectionName).findOne({ id });
        if (!existing) return res.status(404).json({ status: 'error', message: 'Record not found' });
        await col(collectionName).deleteOne({ id });
        res.status(200).json({ status: 'success', message: 'Deleted successfully' });
      } catch (err) { next(err); }
    }
  };
}

// ─── CONTROLLERS ─────────────────────────────────────────────────────────────
exports.projects = makeController('projects', ['name', 'location']);
exports.vendors = makeController('vendors', ['name', 'contactPerson', 'phone']);
exports.categories = makeController('categories', ['name']);
exports.items = makeController('items', ['name', 'unit']);
