const mongoose = require('mongoose');

const col = (name) => mongoose.connection.db.collection(name);

// ─── PURCHASE REQUESTS ────────────────────────────────────────────────────────
exports.getAllPRs = async (req, res, next) => {
  try {
    const docs = await col('purchaserequests').find({}).sort({ requestDate: -1 }).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.createPR = async (req, res, next) => {
  try {
    const { projectId, requestedBy, requiredDate, priority, items, prNumber } = req.body;
    if (!projectId || !requiredDate || !items?.length) {
      return res.status(400).json({ status: 'error', message: 'projectId, requiredDate, and items are required' });
    }
    const prNum = prNumber || `PR-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const newPR = {
      id: `pr-${Date.now()}`,
      prNumber: prNum,
      requestDate: new Date().toISOString().split('T')[0],
      projectId, requestedBy, requiredDate,
      priority: priority || 'Medium',
      items: items || [],
      status: 'Submitted',
      history: [{ status: 'Submitted', user: requestedBy || 'System', timestamp: new Date().toISOString(), remarks: 'PR Created' }],
      ...req.body
    };
    await col('purchaserequests').insertOne(newPR);
    const { _id, ...rest } = newPR;
    res.status(201).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.updatePR = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await col('purchaserequests').findOne({ id });
    if (!existing) return res.status(404).json({ status: 'error', message: 'PR not found' });
    const updated = { ...existing, ...req.body, id };
    await col('purchaserequests').replaceOne({ id }, updated);
    const { _id, ...rest } = updated;
    res.status(200).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.deletePR = async (req, res, next) => {
  try {
    const { id } = req.params;
    await col('purchaserequests').deleteOne({ id });
    res.status(200).json({ status: 'success', message: 'PR deleted' });
  } catch (err) { next(err); }
};

// ─── PURCHASE ORDERS ─────────────────────────────────────────────────────────
exports.getAllPOs = async (req, res, next) => {
  try {
    const docs = await col('purchaseorders').find({}).sort({ poDate: -1 }).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.createPO = async (req, res, next) => {
  try {
    const { prId, vendorId, items, expectedDeliveryDate } = req.body;
    if (!prId || !vendorId || !items?.length) {
      return res.status(400).json({ status: 'error', message: 'prId, vendorId, and items are required' });
    }
    const poNum = `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const newPO = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      poDate: new Date().toISOString().split('T')[0],
      status: 'Approved',
      ...req.body
    };
    await col('purchaseorders').insertOne(newPO);
    // Update PR status to PO Created
    if (prId) {
      await col('purchaserequests').updateOne({ id: prId }, { $set: { status: 'PO Created' } });
    }
    const { _id, ...rest } = newPO;
    res.status(201).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.updatePO = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await col('purchaseorders').findOne({ id });
    if (!existing) return res.status(404).json({ status: 'error', message: 'PO not found' });
    const updated = { ...existing, ...req.body, id };
    await col('purchaseorders').replaceOne({ id }, updated);
    const { _id, ...rest } = updated;
    res.status(200).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.deletePO = async (req, res, next) => {
  try {
    const { id } = req.params;
    await col('purchaseorders').deleteOne({ id });
    res.status(200).json({ status: 'success', message: 'PO deleted' });
  } catch (err) { next(err); }
};

// ─── GRNs ─────────────────────────────────────────────────────────────────────
exports.getAllGRNs = async (req, res, next) => {
  try {
    const docs = await col('grns').find({}).sort({ grnDate: -1 }).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.createGRN = async (req, res, next) => {
  try {
    const { poId, items } = req.body;
    if (!poId) return res.status(400).json({ status: 'error', message: 'poId is required' });

    const grnNum = `GRN-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const newGRN = {
      id: `grn-${Date.now()}`,
      grnNumber: grnNum,
      grnDate: new Date().toISOString().split('T')[0],
      receivedDate: new Date().toISOString().split('T')[0],
      ...req.body
    };
    await col('grns').insertOne(newGRN);

    // Update stock for each GRN item
    if (Array.isArray(items)) {
      const po = await col('purchaseorders').findOne({ id: poId });
      for (const it of items) {
        const existingStock = await col('stock').findOne({ projectId: po?.projectId, itemId: it.itemId });
        if (existingStock) {
          await col('stock').updateOne(
            { projectId: po?.projectId, itemId: it.itemId },
            { $inc: { quantity: it.receivedQty || it.quantity || 0 }, $set: { lastUpdated: new Date().toISOString() } }
          );
        } else {
          await col('stock').insertOne({
            id: `stk-${Date.now()}-${it.itemId}`,
            projectId: po?.projectId,
            itemId: it.itemId,
            itemName: it.itemName,
            unit: it.unit || 'Pcs',
            quantity: it.receivedQty || it.quantity || 0,
            lastUpdated: new Date().toISOString()
          });
        }
        // Record stock transaction
        await col('stocktransactions').insertOne({
          id: `txn-${Date.now()}-${it.itemId}`,
          projectId: po?.projectId,
          itemId: it.itemId,
          itemName: it.itemName,
          type: 'IN',
          transactionType: 'INWARD_GRN',
          quantity: it.receivedQty || it.quantity || 0,
          referenceId: newGRN.id,
          referenceNumber: grnNum,
          referenceType: 'GRN',
          transactionDate: new Date().toISOString().split('T')[0],
          createdBy: req.body.receivedBy || 'System'
        });
      }
    }

    // Update PO status
    await col('purchaseorders').updateOne({ id: poId }, { $set: { status: 'Partially Received' } });

    const { _id, ...rest } = newGRN;
    res.status(201).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.updateGRN = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await col('grns').findOne({ id });
    if (!existing) return res.status(404).json({ status: 'error', message: 'GRN not found' });
    const updated = { ...existing, ...req.body, id };
    await col('grns').replaceOne({ id }, updated);
    const { _id, ...rest } = updated;
    res.status(200).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.deleteGRN = async (req, res, next) => {
  try {
    const { id } = req.params;
    await col('grns').deleteOne({ id });
    res.status(200).json({ status: 'success', message: 'GRN deleted' });
  } catch (err) { next(err); }
};
