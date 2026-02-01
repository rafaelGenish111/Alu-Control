const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { DEFAULT_TENANT_ID } = require('../middleware/tenantHandler');

// Helper to create a signed JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Registration – primarily used to create the first admin
exports.registerUser = async (req, res) => {
  const { name, email, password, role, language } = req.body;
  const tenantId = req.tenantId || DEFAULT_TENANT_ID;
  try {
    const userExists = await User.findOne({ tenantId, email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ tenantId, name, email, password, role, language });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        token: generateToken(user._id, user.role)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login handler – tenantId optional in body (default: default_glass_dynamics)
exports.loginUser = async (req, res) => {
  const { email, password, tenantId: bodyTenantId } = req.body;
  const tenantId = bodyTenantId || DEFAULT_TENANT_ID;

  console.log(`🔐 [loginUser] Attempting login for: ${email} (tenantId: ${tenantId})`);

  // Validate input
  if (!email || !password) {
    console.log(`🔴 [loginUser] Missing email or password`);
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ tenantId, email });

    if (!user) {
      console.log(`🔴 [loginUser] User not found: ${email} (tenantId: ${tenantId})`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      console.log(`🔴 [loginUser] Invalid password for: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);
    console.log(`✅ [loginUser] Login successful: ${email} (role: ${user.role}, tenantId: ${user.tenantId})`);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      tenantId: user.tenantId,
      token: token
    });
  } catch (error) {
    console.error('🔴 [loginUser] Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// Admin-only endpoint to create a new user (wired in router)
exports.createUser = async (req, res) => {
  const { name, email, password, role, language, phone } = req.body;
  const tenantId = req.tenantId;

  try {
    const userExists = await User.findOne({ tenantId, email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ tenantId, name, email, password, role, language, phone });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'User created successfully by Admin'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .setOptions({ tenantId: req.tenantId })
      .select('-password')
      .sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, language, password } = req.body;

  try {
    const user = await User.findOne({ _id: id, tenantId: req.tenantId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // עדכון שדות רגילים
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    user.language = language || user.language;

    // עדכון סיסמה (רק אם הוזנה חדשה)
    if (password && password.trim() !== '') {
      user.password = password; // המודל יצפין את זה לבד לפני השמירה
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ _id: id, tenantId: req.tenantId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent deleting yourself
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.deleteOne({ _id: id, tenantId: req.tenantId });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};