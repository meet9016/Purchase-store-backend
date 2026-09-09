const VendorBill = require('../models/VendorBill');
const PaymentRequest = require('../models/PaymentRequest');
const PaymentEntry = require('../models/PaymentEntry');
const ApiResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const asyncHandler = require('../utils/asyncHandler');

// ─── VENDOR BILLS ─────────────────────────────────────────────────────────────
exports.getAllBills = asyncHandler(async (req, res) => {
  const searchFields = ['billNumber', 'vendorInvoiceNo', 'vendorName', 'projectName', 'status', 'paymentStatus'];
  const features = new ApiFeatures(VendorBill.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(res, data, 'Vendor bills retrieved', 200, features.paginationInfo);
});

exports.createBill = asyncHandler(async (req, res) => {
  const { poId, billAmount } = req.body;
  if (!poId || billAmount === undefined) {
    return ApiResponse.badRequest(res, 'poId and billAmount are required');
  }

  const billNum = req.body.billNumber || `BILL-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  const billDate = req.body.billDate || new Date().toISOString().split('T')[0];
  const creditPeriod = req.body.creditPeriod || 30;
  const dueDate =
    req.body.dueDate ||
    new Date(new Date(billDate).getTime() + creditPeriod * 86400000).toISOString().split('T')[0];

  const billId = req.body.id || `bill-${Date.now()}`;

  const newBill = await VendorBill.create({
    ...req.body,
    id: billId,
    billNumber: billNum,
    billDate,
    creditPeriod,
    dueDate,
    paidAmount: 0,
    outstandingAmount: Number(billAmount),
    status: req.body.status || 'Submitted',
    paymentStatus: req.body.paymentStatus || 'Upcoming',
    billAmount: Number(billAmount),
  });

  return ApiResponse.created(res, newBill, 'Vendor bill created successfully');
});

exports.updateBill = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const bill = await VendorBill.findOneAndUpdate(query, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bill) {
    return ApiResponse.notFound(res, 'Vendor bill not found');
  }

  return ApiResponse.success(res, bill, 'Vendor bill updated successfully');
});

exports.deleteBill = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const bill = await VendorBill.findOneAndDelete(query);
  if (!bill) {
    return ApiResponse.notFound(res, 'Vendor bill not found');
  }

  return ApiResponse.success(res, null, 'Vendor bill deleted successfully');
});

// ─── PAYMENT REQUESTS ─────────────────────────────────────────────────────────
exports.getAllPaymentReqs = asyncHandler(async (req, res) => {
  const searchFields = ['requestNumber', 'vendorName', 'projectName', 'status', 'urgency'];
  const features = new ApiFeatures(PaymentRequest.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(res, data, 'Payment requests retrieved', 200, features.paginationInfo);
});

exports.createPaymentReq = asyncHandler(async (req, res) => {
  const { billId, requestedAmount } = req.body;
  if (!billId || requestedAmount === undefined) {
    return ApiResponse.badRequest(res, 'billId and requestedAmount are required');
  }

  const reqNum = req.body.requestNumber || `REQ-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  const payReqId = req.body.id || `payreq-${Date.now()}`;

  const newReq = await PaymentRequest.create({
    ...req.body,
    id: payReqId,
    requestNumber: reqNum,
    requestId: reqNum,
    requestDate: req.body.requestDate || new Date().toISOString().split('T')[0],
    status: req.body.status || 'Submitted',
  });

  // Update bill status
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(billId);
  const billQuery = isObjectId ? { _id: billId } : { id: billId };
  await VendorBill.updateOne(billQuery, { $set: { paymentStatus: 'Payment Request Pending' } });

  return ApiResponse.created(res, newReq, 'Payment request created successfully');
});

exports.updatePaymentReq = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const payReq = await PaymentRequest.findOneAndUpdate(query, req.body, {
    new: true,
    runValidators: true,
  });

  if (!payReq) {
    return ApiResponse.notFound(res, 'Payment request not found');
  }

  return ApiResponse.success(res, payReq, 'Payment request updated successfully');
});

exports.deletePaymentReq = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const payReq = await PaymentRequest.findOneAndDelete(query);
  if (!payReq) {
    return ApiResponse.notFound(res, 'Payment request not found');
  }

  return ApiResponse.success(res, null, 'Payment request deleted successfully');
});

// ─── PAYMENT ENTRIES ──────────────────────────────────────────────────────────
exports.getAllPaymentEntries = asyncHandler(async (req, res) => {
  const searchFields = ['entryNumber', 'referenceNumber', 'paymentMode', 'paidTo', 'bankName'];
  const features = new ApiFeatures(PaymentEntry.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(res, data, 'Payment entries retrieved', 200, features.paginationInfo);
});

exports.createPaymentEntry = asyncHandler(async (req, res) => {
  const { billId, amountPaid, paymentMode } = req.body;
  if (!amountPaid || !paymentMode) {
    return ApiResponse.badRequest(res, 'amountPaid and paymentMode are required');
  }

  const entryNum = req.body.entryNumber || `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  const entryId = req.body.id || `entry-${Date.now()}`;

  const newEntry = await PaymentEntry.create({
    ...req.body,
    id: entryId,
    entryNumber: entryNum,
    paymentDate: req.body.paymentDate || new Date().toISOString().split('T')[0],
  });

  // Auto-update Bill Outstanding Balance
  if (billId) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(billId);
    const billQuery = isObjectId ? { _id: billId } : { id: billId };
    const bill = await VendorBill.findOne(billQuery);
    if (bill) {
      const newPaid = (bill.paidAmount || 0) + Number(amountPaid);
      const newOutstanding = Math.max(0, bill.billAmount - newPaid);
      const paymentStatus = newOutstanding === 0 ? 'Paid' : newPaid > 0 ? 'Partially Paid' : bill.paymentStatus;
      await VendorBill.updateOne(
        billQuery,
        { $set: { paidAmount: newPaid, outstandingAmount: newOutstanding, paymentStatus } }
      );
    }
  }

  return ApiResponse.created(res, newEntry, 'Payment entry created successfully');
});

exports.updatePaymentEntry = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const entry = await PaymentEntry.findOneAndUpdate(query, req.body, {
    new: true,
    runValidators: true,
  });

  if (!entry) {
    return ApiResponse.notFound(res, 'Payment entry not found');
  }

  return ApiResponse.success(res, entry, 'Payment entry updated successfully');
});

exports.deletePaymentEntry = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const entry = await PaymentEntry.findOneAndDelete(query);
  if (!entry) {
    return ApiResponse.notFound(res, 'Payment entry not found');
  }

  return ApiResponse.success(res, null, 'Payment entry deleted successfully');
});
