const Project = require('../models/Project');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const Item = require('../models/Item');
const ApiResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const asyncHandler = require('../utils/asyncHandler');

// ─── Generic Mongoose Model Controller Factory ────────────────────────────────
function createCrudController(Model, searchFields = ['name'], modelName = 'Record') {
  return {
    getAll: asyncHandler(async (req, res) => {
      const features = new ApiFeatures(Model.find(), req.query, searchFields)
        .search()
        .filter()
        .sort();

      await features.paginate();
      const records = await features.query;

      return ApiResponse.success(
        res,
        records,
        `${modelName}s retrieved successfully`,
        200,
        features.paginationInfo
      );
    }),

    getById: asyncHandler(async (req, res) => {
      // Support querying either by Mongoose _id or custom string id
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
      const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };
      
      const record = await Model.findOne(query);
      if (!record) {
        return ApiResponse.notFound(res, `${modelName} not found`);
      }
      return ApiResponse.success(res, record, `${modelName} details retrieved`);
    }),

    create: asyncHandler(async (req, res) => {
      const record = await Model.create(req.body);
      return ApiResponse.created(res, record, `${modelName} created successfully`);
    }),

    update: asyncHandler(async (req, res) => {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
      const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

      const record = await Model.findOneAndUpdate(query, req.body, {
        new: true,
        runValidators: true,
      });

      if (!record) {
        return ApiResponse.notFound(res, `${modelName} not found`);
      }
      return ApiResponse.success(res, record, `${modelName} updated successfully`);
    }),

    remove: asyncHandler(async (req, res) => {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
      const query = isObjectId ? { _id: req.params.id } : { id: req.params.id };

      const record = await Model.findOneAndDelete(query);
      if (!record) {
        return ApiResponse.notFound(res, `${modelName} not found`);
      }
      return ApiResponse.success(res, null, `${modelName} deleted successfully`);
    }),
  };
}

// ─── Masters Controllers ──────────────────────────────────────────────────────
exports.projects = createCrudController(Project, ['name', 'location', 'status'], 'Project');
exports.vendors = createCrudController(Vendor, ['name', 'contactPerson', 'phone', 'email', 'gstNo'], 'Vendor');
exports.categories = createCrudController(Category, ['name', 'description'], 'Category');
exports.items = createCrudController(Item, ['name', 'itemCode', 'subCategory', 'categoryName'], 'Item');
