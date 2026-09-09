const PurchaseRequest = require('../models/PurchaseRequest');
const PurchaseOrder = require('../models/PurchaseOrder');
const GRN = require('../models/GRN');
const Stock = require('../models/Stock');
const StockTransaction = require('../models/StockTransaction');
const ApiResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const asyncHandler = require('../utils/asyncHandler');

// ─── PURCHASE REQUESTS ────────────────────────────────────────────────────────
exports.getAllPRs = asyncHandler(async (req, res) => {
  const searchFields = ['prNumber', 'projectName', 'requesterName', 'status', 'priority'];
  const features = new ApiFeatures(PurchaseRequest.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(res, data, 'Purchase requests retrieved', 200, features.paginationInfo);
});

exports.createPR = asyncHandler(async (req, res) => {
  const { projectId, requestedBy, requiredDate, items, prNumber } = req.body;
  if (!projectId || !requiredDate || !items?.length) {
    return ApiResponse.badRequest(res, 'projectId, requiredDate, and items are required');
  }

  const prNum = prNumber || `PR-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  const prId = req.body.id || `pr-${Date.now()}`;

  const newPR = await PurchaseRequest.create({
    ...req.body,
    id: prId,
    prNumber: prNum,
    requestDate: req.body.requestDate || new Date().toISOString().split('T')[0],
    status: req.body.status || 'Submitted',
    history: req.body.history || [
      {
        status: 'Submitted',
        user: requestedBy || 'System',
        timestamp: new Date().toISOString(),
        remarks: 'PR Created',
      },
    ],
  });

  return ApiResponse.created(res, newPR, 'Purchase Request created successfully');
});

exports.updatePR = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const pr = await PurchaseRequest.findOneAndUpdate(query, req.body, {
    new: true,
    runValidators: true,
  });

  if (!pr) {
    return ApiResponse.notFound(res, 'Purchase Request not found');
  }

  return ApiResponse.success(res, pr, 'Purchase Request updated successfully');
});

exports.deletePR = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const pr = await PurchaseRequest.findOneAndDelete(query);
  if (!pr) {
    return ApiResponse.notFound(res, 'Purchase Request not found');
  }

  return ApiResponse.success(res, null, 'Purchase Request deleted successfully');
});

// ─── PURCHASE ORDERS ──────────────────────────────────────────────────────────
exports.getAllPOs = asyncHandler(async (req, res) => {
  const searchFields = ['poNumber', 'vendorName', 'projectName', 'status'];
  const features = new ApiFeatures(PurchaseOrder.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(res, data, 'Purchase orders retrieved', 200, features.paginationInfo);
});

exports.createPO = asyncHandler(async (req, res) => {
  const { prId, vendorId, items } = req.body;
  if (!vendorId || !items?.length) {
    return ApiResponse.badRequest(res, 'vendorId and items are required');
  }

  const poNum = req.body.poNumber || `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  const poId = req.body.id || `po-${Date.now()}`;

  const newPO = await PurchaseOrder.create({
    ...req.body,
    id: poId,
    poNumber: poNum,
    poDate: req.body.poDate || new Date().toISOString().split('T')[0],
    status: req.body.status || 'Approved',
  });

  // Link PR status to PO Created if prId provided
  if (prId) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(prId);
    const prQuery = isObjectId ? { _id: prId } : { id: prId };
    await PurchaseRequest.updateOne(prQuery, { $set: { status: 'PO Created' } });
  }

  return ApiResponse.created(res, newPO, 'Purchase Order created successfully');
});

exports.updatePO = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const po = await PurchaseOrder.findOneAndUpdate(query, req.body, {
    new: true,
    runValidators: true,
  });

  if (!po) {
    return ApiResponse.notFound(res, 'Purchase Order not found');
  }

  return ApiResponse.success(res, po, 'Purchase Order updated successfully');
});

exports.deletePO = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const po = await PurchaseOrder.findOneAndDelete(query);
  if (!po) {
    return ApiResponse.notFound(res, 'Purchase Order not found');
  }

  return ApiResponse.success(res, null, 'Purchase Order deleted successfully');
});

// ─── GOODS RECEIPT NOTE (GRN) ─────────────────────────────────────────────────
exports.getAllGRNs = asyncHandler(async (req, res) => {
  const searchFields = ['grnNumber', 'poNumber', 'vendorName', 'projectName', 'status', 'gatePassNo'];
  const features = new ApiFeatures(GRN.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(res, data, 'GRNs retrieved', 200, features.paginationInfo);
});

exports.createGRN = asyncHandler(async (req, res) => {
  const { poId, receivedItems } = req.body;
  if (!poId || !receivedItems?.length) {
    return ApiResponse.badRequest(res, 'poId and receivedItems are required');
  }

  const grnNum = req.body.grnNumber || `GRN-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  const grnId = req.body.id || `grn-${Date.now()}`;

  const newGRN = await GRN.create({
    ...req.body,
    id: grnId,
    grnNumber: grnNum,
    grnDate: req.body.grnDate || new Date().toISOString().split('T')[0],
    status: req.body.status || 'Verified',
  });

  // Update PO status to Received/Partially Received
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(poId);
  const poQuery = isObjectId ? { _id: poId } : { id: poId };
  await PurchaseOrder.updateOne(poQuery, { $set: { status: 'Fully Supplied' } });

  return ApiResponse.created(res, newGRN, 'GRN created successfully');
});

exports.updateGRN = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const grn = await GRN.findOneAndUpdate(query, req.body, {
    new: true,
    runValidators: true,
  });

  if (!grn) {
    return ApiResponse.notFound(res, 'GRN not found');
  }

  return ApiResponse.success(res, grn, 'GRN updated successfully');
});

exports.deleteGRN = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const grn = await GRN.findOneAndDelete(query);
  if (!grn) {
    return ApiResponse.notFound(res, 'GRN not found');
  }

  return ApiResponse.success(res, null, 'GRN deleted successfully');
});
