const mongoose = require('mongoose');

const col = (name) => mongoose.connection.db.collection(name);

// ─── VENDOR BILLS ─────────────────────────────────────────────────────────────
exports.getAllBills = async (req, res, next) => {
  try {
    const docs = await col('vendorbills').find({}).sort({ billDate: -1 }).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.createBill = async (req, res, next) => {
  try {
    const { poId, billAmount } = req.body;
    if (!poId || billAmount === undefined) {
      return res.status(400).json({ status: 'error', message: 'poId and billAmount are required' });
    }
    const billNum = `BILL-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const billDate = req.body.billDate || new Date().toISOString().split('T')[0];
    const creditPeriod = req.body.creditPeriod || 30;
    const dueDate = req.body.dueDate || new Date(new Date(billDate).getTime() + creditPeriod * 86400000).toISOString().split('T')[0];

    const newBill = {
      id: `bill-${Date.now()}`,
      billNumber: billNum,
      billDate,
      creditPeriod,
      dueDate,
      paidAmount: 0,
      outstandingAmount: billAmount,
      status: 'Submitted',
      paymentStatus: 'Upcoming',
      ...req.body,
      billAmount: Number(billAmount)
    };
    await col('vendorbills').insertOne(newBill);
    const { _id, ...rest } = newBill;
    res.status(201).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.updateBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await col('vendorbills').findOne({ id });
    if (!existing) return res.status(404).json({ status: 'error', message: 'Bill not found' });
    const updated = { ...existing, ...req.body, id };
    await col('vendorbills').replaceOne({ id }, updated);
    const { _id, ...rest } = updated;
    res.status(200).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.deleteBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    await col('vendorbills').deleteOne({ id });
    res.status(200).json({ status: 'success', message: 'Bill deleted' });
  } catch (err) { next(err); }
};

// ─── PAYMENT REQUESTS ─────────────────────────────────────────────────────────
exports.getAllPaymentReqs = async (req, res, next) => {
  try {
    const docs = await col('paymentrequests').find({}).sort({ requestDate: -1 }).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.createPaymentReq = async (req, res, next) => {
  try {
    const { billId, requestedAmount } = req.body;
    if (!billId || requestedAmount === undefined) {
      return res.status(400).json({ status: 'error', message: 'billId and requestedAmount are required' });
    }
    const reqNum = `REQ-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const newReq = {
      id: `payreq-${Date.now()}`,
      requestNumber: reqNum,
      requestId: reqNum,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      ...req.body
    };
    await col('paymentrequests').insertOne(newReq);
    // Update bill payment status
    await col('vendorbills').updateOne({ id: billId }, { $set: { paymentStatus: 'Payment Request Pending' } });
    const { _id, ...rest } = newReq;
    res.status(201).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.updatePaymentReq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await col('paymentrequests').findOne({ id });
    if (!existing) return res.status(404).json({ status: 'error', message: 'Payment request not found' });
    const updated = { ...existing, ...req.body, id };
    await col('paymentrequests').replaceOne({ id }, updated);
    const { _id, ...rest } = updated;
    res.status(200).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.deletePaymentReq = async (req, res, next) => {
  try {
    const { id } = req.params;
    await col('paymentrequests').deleteOne({ id });
    res.status(200).json({ status: 'success', message: 'Payment request deleted' });
  } catch (err) { next(err); }
};

// ─── PAYMENT ENTRIES ─────────────────────────────────────────────────────────
exports.getAllPaymentEntries = async (req, res, next) => {
  try {
    const docs = await col('paymententries').find({}).sort({ paymentDate: -1 }).toArray();
    res.status(200).json({ status: 'success', count: docs.length, data: docs.map(({ _id, ...r }) => r) });
  } catch (err) { next(err); }
};

exports.createPaymentEntry = async (req, res, next) => {
  try {
    const { billId, paymentAmount, paymentMode } = req.body;
    if (!billId || paymentAmount === undefined || !paymentMode) {
      return res.status(400).json({ status: 'error', message: 'billId, paymentAmount, and paymentMode are required' });
    }
    const payNum = `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const newEntry = {
      id: `pay-${Date.now()}`,
      paymentId: payNum,
      paymentNumber: payNum,
      paymentDate: new Date().toISOString().split('T')[0],
      ...req.body,
      paymentAmount: Number(paymentAmount)
    };
    await col('paymententries').insertOne(newEntry);

    // Update bill: paidAmount, outstandingAmount, status
    const bill = await col('vendorbills').findOne({ id: billId });
    if (bill) {
      const newPaid = (bill.paidAmount || 0) + Number(paymentAmount);
      const newOutstanding = Math.max(0, (bill.billAmount || 0) - newPaid);
      const newStatus = newOutstanding === 0 ? 'Paid' : 'Partially Paid';
      await col('vendorbills').updateOne(
        { id: billId },
        { $set: { paidAmount: newPaid, outstandingAmount: newOutstanding, status: newStatus, paymentStatus: newStatus } }
      );
    }

    const { _id, ...rest } = newEntry;
    res.status(201).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.updatePaymentEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await col('paymententries').findOne({ id });
    if (!existing) return res.status(404).json({ status: 'error', message: 'Payment entry not found' });
    const updated = { ...existing, ...req.body, id };
    await col('paymententries').replaceOne({ id }, updated);
    const { _id, ...rest } = updated;
    res.status(200).json({ status: 'success', data: rest });
  } catch (err) { next(err); }
};

exports.deletePaymentEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    await col('paymententries').deleteOne({ id });
    res.status(200).json({ status: 'success', message: 'Payment entry deleted' });
  } catch (err) { next(err); }
};
