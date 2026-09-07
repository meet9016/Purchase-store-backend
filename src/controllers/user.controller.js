const User = require('../models/User');

// Initial Default Seed Users
const INITIAL_USERS = [
  { name: 'Alok Sharma', email: 'admin@gmail.com', password: '123456', role: 'Admin', department: 'IT / Operations', active: true },
];

// GET /api/users - Fetch all staff users
exports.getUsers = async (req, res, next) => {
  try {
    let users = await User.find({}).sort({ createdAt: -1 });

    // Seed default admin user if collection is empty
    if (users.length === 0) {
      users = await User.insertMany(INITIAL_USERS);
    }

    res.status(200).json({
      status: 'success',
      count: users.length,
      data: users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department,
        projectAccess: u.projectAccess || [],
        active: u.active
      }))
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users - Admin creates or updates staff user & assigns role & project access (Upsert safe)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, projectAccess, active } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ status: 'error', message: 'Name, email and assigned role are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      // Safely update existing user instead of failing with 400 error
      existingUser.name = name;
      existingUser.role = role;
      if (department) existingUser.department = department;
      if (Array.isArray(projectAccess)) existingUser.projectAccess = projectAccess;
      if (active !== undefined) existingUser.active = active;
      if (password && password.trim().length > 0) {
        existingUser.password = password.trim();
      }
      await existingUser.save();

      return res.status(200).json({
        status: 'success',
        message: `Staff member ${name} updated successfully`,
        user: {
          id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          department: existingUser.department,
          projectAccess: existingUser.projectAccess,
          active: existingUser.active
        }
      });
    }

    const newUser = await User.create({
      name,
      email: cleanEmail,
      password: password || '123456',
      role,
      department: department || 'Operations Division',
      projectAccess: Array.isArray(projectAccess) ? projectAccess : [],
      active: active !== undefined ? active : true
    });

    res.status(201).json({
      status: 'success',
      message: `Staff member ${name} created successfully with role ${role}`,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        projectAccess: newUser.projectAccess,
        active: newUser.active
      }
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id - Update user details, role, department, or active status
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, department, projectAccess, active, password, email } = req.body;

    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id);
    }
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Staff user not found' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (Array.isArray(projectAccess)) user.projectAccess = projectAccess;
    if (active !== undefined) user.active = active;
    if (password && password.trim().length > 0) {
      user.password = password.trim();
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: `Staff user ${user.name} updated successfully`,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        projectAccess: user.projectAccess,
        active: user.active
      }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id - Delete or Deactivate staff user
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id);
    }
    if (!user) {
      user = await User.findOne({ email: id.toLowerCase().trim() });
    }

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'Staff user not found' });
    }

    // Delete the record from database
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      status: 'success',
      message: `Staff account ${user.name} has been deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};
