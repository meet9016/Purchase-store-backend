const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RolePermission = require('../models/RolePermission');
const { JWT_SECRET } = require('../middleware/auth.middleware');

// Default Role Module Permissions Mapping
const DEFAULT_ROLE_PERMISSIONS = [
  { role: 'Admin', modules: ['dashboard', 'masters', 'pr', 'po', 'grn', 'stock', 'outward', 'bills', 'payment-req', 'payments', 'reports', 'audit', 'notifications', 'permissions'] },
  { role: 'Requester', modules: ['dashboard', 'pr', 'stock', 'reports', 'notifications'] },
  { role: 'Approver', modules: ['dashboard', 'pr', 'po', 'payment-req', 'reports', 'notifications'] },
  { role: 'Purchase', modules: ['dashboard', 'masters', 'pr', 'po', 'grn', 'vendors', 'reports', 'notifications'] },
  { role: 'Store', modules: ['dashboard', 'grn', 'stock', 'outward', 'reports', 'notifications'] },
  { role: 'Accounts', modules: ['dashboard', 'bills', 'payment-req', 'payments', 'reports', 'notifications'] },
  { role: 'Management', modules: ['dashboard', 'reports', 'audit', 'notifications'] },
];

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Please provide email and password' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    // Fallback seed for Admin account if missing
    if (!user && email.toLowerCase() === 'admin@gmail.com') {
      user = await User.create({
        name: 'Alok Sharma',
        email: 'admin@gmail.com',
        password: password || '123456',
        role: 'Admin',
        department: 'IT / Operations',
        active: true
      });
    }

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    if (!user.active) {
      return res.status(403).json({ status: 'error', message: 'Account is currently inactive. Contact Admin.' });
    }

    // Verify password with bcrypt or plain text fallback
    let isMatch = false;
    if (user.password) {
      try {
        isMatch = await user.comparePassword(password);
      } catch (err) {
        // Plain text comparison fallback for legacy records
        isMatch = user.password === password;
      }
    }
    // Allow default password '123456' only if no custom password was ever set
    if (!isMatch && password === '123456' && (!user.password || user.password === '123456')) {
      isMatch = true;
    }
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    // Fetch user role permissions
    let rolePerm = await RolePermission.findOne({ role: user.role });
    if (!rolePerm) {
      const defaultMatch = DEFAULT_ROLE_PERMISSIONS.find(r => r.role === user.role);
      const modules = defaultMatch ? defaultMatch.modules : ['dashboard'];
      rolePerm = await RolePermission.create({ role: user.role, modules });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || 'Operations',
      projectAccess: user.projectAccess || [],
      active: user.active,
      modules: rolePerm.modules
    };

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const targetEmail = (req.user && req.user.email) ? req.user.email : req.query.email;

    if (!targetEmail) {
      return res.status(400).json({ status: 'error', message: 'Email query or Authorization token required' });
    }

    const user = await User.findOne({ email: targetEmail.toLowerCase() });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const rolePerm = await RolePermission.findOne({ role: user.role });
    const modules = rolePerm ? rolePerm.modules : ['dashboard'];

    res.status(200).json({
      status: 'success',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        projectAccess: user.projectAccess || [],
        active: user.active,
        modules
      }
    });
  } catch (error) {
    next(error);
  }
};
