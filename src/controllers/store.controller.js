const Stock = require('../models/Stock');
const StockTransaction = require('../models/StockTransaction');
const StoreOutward = require('../models/StoreOutward');
const ApiResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const asyncHandler = require('../utils/asyncHandler');

// ─── STOCK ────────────────────────────────────────────────────────────────────
exports.getAllStock = asyncHandler(async (req, res) => {
  const searchFields = ['itemName', 'itemCode', 'categoryName', 'location', 'projectName'];
  const features = new ApiFeatures(Stock.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(res, data, 'Stock list retrieved', 200, features.paginationInfo);
});

exports.updateStock = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const stock = await Stock.findOneAndUpdate(query, req.body, {
    new: true,
    runValidators: true,
  });

  if (!stock) {
    return ApiResponse.notFound(res, 'Stock record not found');
  }

  return ApiResponse.success(res, stock, 'Stock record updated successfully');
});

exports.getAllStockTransactions = asyncHandler(async (req, res) => {
  const searchFields = ['itemName', 'referenceNumber', 'type', 'transactionType'];
  const features = new ApiFeatures(StockTransaction.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(
    res,
    data,
    'Stock transactions retrieved',
    200,
    features.paginationInfo
  );
});

// ─── STORE OUTWARDS ───────────────────────────────────────────────────────────
exports.getAllOutwards = asyncHandler(async (req, res) => {
  const searchFields = ['outwardNumber', 'issueNumber', 'issuedTo', 'department', 'projectName'];
  const features = new ApiFeatures(StoreOutward.find(), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const data = await features.query;

  return ApiResponse.success(res, data, 'Store outwards retrieved', 200, features.paginationInfo);
});

exports.createOutward = asyncHandler(async (req, res) => {
  const { projectId, issuedTo, items } = req.body;
  if (!issuedTo || !items?.length) {
    return ApiResponse.badRequest(res, 'issuedTo and items are required fields');
  }

  const outNum = req.body.outwardNumber || `OUT-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  const outId = req.body.id || `out-${Date.now()}`;

  const newOutward = await StoreOutward.create({
    ...req.body,
    id: outId,
    outwardNumber: outNum,
    issueNumber: outNum,
    issueDate: req.body.issueDate || new Date().toISOString().split('T')[0],
    date: req.body.date || new Date().toISOString().split('T')[0],
    status: req.body.status || 'Issued',
  });

  // Automatically update stock levels & record stock transactions
  if (Array.isArray(items) && projectId) {
    for (const it of items) {
      await Stock.updateOne(
        { projectId, itemId: it.itemId },
        {
          $inc: { quantity: -(it.quantity || 0) },
          $set: { lastUpdated: new Date().toISOString() },
        }
      );

      await StockTransaction.create({
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
        createdBy: req.body.issuedBy || 'System',
      });
    }
  }

  return ApiResponse.created(res, newOutward, 'Store Outward created successfully');
});

exports.updateOutward = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const outward = await StoreOutward.findOneAndUpdate(query, req.body, {
    new: true,
    runValidators: true,
  });

  if (!outward) {
    return ApiResponse.notFound(res, 'Store Outward not found');
  }

  return ApiResponse.success(res, outward, 'Store Outward updated successfully');
});

exports.deleteOutward = asyncHandler(async (req, res) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
  const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

  const outward = await StoreOutward.findOneAndDelete(query);
  if (!outward) {
    return ApiResponse.notFound(res, 'Store Outward not found');
  }

  return ApiResponse.success(res, null, 'Store Outward deleted successfully');
});
