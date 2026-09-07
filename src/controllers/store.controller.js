const mongoose = require('mongoose');

const col = (name) => mongoose.connection.db.collection(name);

// ─── STOCK ────────────────────────────────────────────────────────────────────
exports.getAllStock = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.projectId) filter.projectId = req.query.projectId;
    const docs = await col('stock').find(filter).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await col('stock').findOne({ id });
    if (!existing) return res.status(404).json({ status: 'error', message: 'Stock record not found' });
    const updated = { ...existing, ...req.body, id };
    await col('stock').replaceOne({ id }, updated);
    const { _id, ...rest } = updated;
    res.status(200).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.getAllStockTransactions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.projectId) filter.projectId = req.query.projectId;
    if (req.query.itemId) filter.itemId = req.query.itemId;
    const docs = await col('stocktransactions').find(filter).sort({ transactionDate: -1 }).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

// ─── STORE OUTWARDS ───────────────────────────────────────────────────────────
exports.getAllOutwards = async (req, res, next) => {
  try {
    const docs = await col('storeoutwards').find({}).sort({ issueDate: -1 }).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.createOutward = async (req, res, next) => {
  try {
    const { projectId, issuedTo, department, purpose, items } = req.body;
    if (!issuedTo || !items?.length) {
      return res.status(400).json({ status: 'error', message: 'issuedTo and items are required' });
    }

    const outNum = `OUT-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const newOutward = {
      id: `out-${Date.now()}`,
      outwardNumber: outNum,
      issueNumber: outNum,
      issueDate: new Date().toISOString().split('T')[0],
      date: new Date().toISOString().split('T')[0],
      status: 'Issued',
      ...req.body
    };
    await col('storeoutwards').insertOne(newOutward);

    // Deduct stock for each issued item
    if (Array.isArray(items) && projectId) {
      for (const it of items) {
        await col('stock').updateOne(
          { projectId, itemId: it.itemId },
          { $inc: { quantity: -(it.quantity || 0) }, $set: { lastUpdated: new Date().toISOString() } }
        );
        // Record stock transaction
        await col('stocktransactions').insertOne({
          id: `txn-${Date.now()}-${it.itemId}`,
          projectId,
          itemId: it.itemId,
          itemName: it.itemName,
          type: 'OUT',
          transactionType: 'OUTWARD_ISSUE',
          quantity: it.quantity || 0,
          referenceId: newOutward.id,
          referenceNumber: outNum,
          referenceType: 'OUTWARD',
          transactionDate: new Date().toISOString().split('T')[0],
          createdBy: req.body.issuedBy || 'System'
        });
      }
    }

    const { _id, ...rest } = newOutward;
    res.status(201).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.updateOutward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await col('storeoutwards').findOne({ id });
    if (!existing) return res.status(404).json({ status: 'error', message: 'Outward not found' });
    const updated = { ...existing, ...req.body, id };
    await col('storeoutwards').replaceOne({ id }, updated);
    const { _id, ...rest } = updated;
    res.status(200).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.deleteOutward = async (req, res, next) => {
  try {
    const { id } = req.params;
    await col('storeoutwards').deleteOne({ id });
    res.status(200).json({ status: 'success', message: 'Outward deleted' });
  } catch (err) { next(err); }
};
