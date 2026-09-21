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

const RolePermission = require('../models/RolePermission');

const DEFAULT_SYSTEM_ROLES = [
  { role: 'Admin', name: 'Admin', description: 'Complete system control, user administration, & full override permissions', isSystemRole: true, status: 'Active' },
  { role: 'Requester', name: 'Requester', description: 'Site engineer / user raising Purchase Requests (PR) and tracking inventory', isSystemRole: true, status: 'Active' },
  { role: 'Approver', name: 'Approver', description: 'Authorizer approving/rejecting PRs, POs, and Payment Requests', isSystemRole: true, status: 'Active' },
  { role: 'Purchase', name: 'Purchase', description: 'Procurement team generating POs, managing vendors, and materials', isSystemRole: true, status: 'Active' },
  { role: 'Store', name: 'Store', description: 'Storekeeper managing material inward (GRN), inventory, and outward issues', isSystemRole: true, status: 'Active' },
  { role: 'Accounts', name: 'Accounts', description: 'Finance team managing vendor invoices/bills and payment disbursements', isSystemRole: true, status: 'Active' },
  { role: 'Management', name: 'Management', description: 'Executive team reviewing audit trails, KPIs, and reports', isSystemRole: true, status: 'Active' }
];

// Seed default roles if none exist
async function ensureDefaultRoles() {
  try {
    const count = await RolePermission.countDocuments();
    if (count === 0) {
      await RolePermission.insertMany(DEFAULT_SYSTEM_ROLES);
    }
  } catch (e) {
    console.warn('Error checking/seeding default roles:', e?.message || e);
  }
}

// ─── Masters Controllers ──────────────────────────────────────────────────────
exports.projects = createCrudController(Project, ['name', 'location', 'status'], 'Project');
exports.vendors = createCrudController(Vendor, ['name', 'contactPerson', 'phone', 'email', 'gstNo'], 'Vendor');
exports.categories = createCrudController(Category, ['name', 'description'], 'Category');
exports.items = createCrudController(Item, ['name', 'itemCode', 'subCategory', 'categoryName'], 'Item');

// ─── Roles Master Controller ──────────────────────────────────────────────────
exports.roles = {
  getAll: asyncHandler(async (req, res) => {
    await ensureDefaultRoles();

    const searchFields = ['role', 'name', 'description', 'status'];
    const features = new ApiFeatures(RolePermission.find(), req.query, searchFields)
      .search()
      .filter()
      .sort();

    await features.paginate();
    const records = await features.query;

    return ApiResponse.success(
      res,
      records,
      'Roles retrieved successfully',
      200,
      features.paginationInfo
    );
  }),

  getById: asyncHandler(async (req, res) => {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { role: req.params.id };

    const record = await RolePermission.findOne(query);
    if (!record) {
      return ApiResponse.notFound(res, 'Role not found');
    }
    return ApiResponse.success(res, record, 'Role details retrieved');
  }),

  create: asyncHandler(async (req, res) => {
    const { role, name, description, status, permissions, modules } = req.body;
    const roleId = (role || name || '').trim();

    if (!roleId) {
      return ApiResponse.badRequest(res, 'Role name is required');
    }

    const existing = await RolePermission.findOne({ role: { $regex: new RegExp(`^${roleId}$`, 'i') } });
    if (existing) {
      return ApiResponse.badRequest(res, `Role '${roleId}' already exists`);
    }

    const record = await RolePermission.create({
      role: roleId,
      name: name || roleId,
      description: description || '',
      status: status || 'Active',
      isSystemRole: false,
      permissions: permissions || {},
      modules: modules || ['dashboard']
    });

    return ApiResponse.created(res, record, 'Role created successfully');
  }),

  update: asyncHandler(async (req, res) => {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { role: req.params.id };

    const existing = await RolePermission.findOne(query);
    if (!existing) {
      return ApiResponse.notFound(res, 'Role not found');
    }

    // Prevent renaming system Admin role
    if (existing.isSystemRole && existing.role === 'Admin' && req.body.role && req.body.role !== 'Admin') {
      return ApiResponse.badRequest(res, 'Cannot change system Admin role identifier');
    }

    const updateData = { ...req.body };
    if (!updateData.name && updateData.role) {
      updateData.name = updateData.role;
    }

    const updated = await RolePermission.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    });

    return ApiResponse.success(res, updated, 'Role updated successfully');
  }),

  remove: asyncHandler(async (req, res) => {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { role: req.params.id };

    const role = await RolePermission.findOne(query);
    if (!role) {
      return ApiResponse.notFound(res, 'Role not found');
    }

    if (role.role === 'Admin') {
      return ApiResponse.badRequest(res, 'System Admin role cannot be deleted');
    }

    await RolePermission.findOneAndDelete(query);
    return ApiResponse.success(res, null, `Role '${role.role}' deleted successfully`);
  }),
};

