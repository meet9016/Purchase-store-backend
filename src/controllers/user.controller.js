const User = require('../models/User');
const RolePermission = require('../models/RolePermission');
const ApiResponse = require('../utils/apiResponse');
const ApiFeatures = require('../utils/apiFeatures');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/users - List users with universal search, filter, pagination
exports.getAllUsers = asyncHandler(async (req, res) => {
  const searchFields = ['name', 'email', 'role', 'department'];
  const features = new ApiFeatures(User.find().select('-password'), req.query, searchFields)
    .search()
    .filter()
    .sort();

  await features.paginate();
  const users = await features.query;

  return ApiResponse.success(
    res,
    users,
    'Users retrieved successfully',
    200,
    features.paginationInfo
  );
});

// GET /api/users/:id
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }
  return ApiResponse.success(res, user, 'User details retrieved');
});

// POST /api/users
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, role, department, projectAccess, password } = req.body;

  if (!name || !email || !role) {
    return ApiResponse.badRequest(res, 'Name, email, and role are required fields');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return ApiResponse.badRequest(res, 'A user with this email address already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    role,
    department: department || 'Operations',
    projectAccess: projectAccess || [],
    password: password || '123456',
    active: true,
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  return ApiResponse.created(res, userResponse, 'User created successfully');
});

// PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  delete updates.password; // Handle password updates separately if needed

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  return ApiResponse.success(res, user, 'User updated successfully');
});

// DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }
  return ApiResponse.success(res, null, 'User deleted successfully');
});
