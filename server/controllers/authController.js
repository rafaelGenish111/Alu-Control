const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to create a signed JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Registration – primarily used to create the first admin
exports.registerUser = async (req, res) => {
  const { name, email, password, role, language } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role, language });

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

// Login handler
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Admin-only endpoint to create a new user (wired in router)
exports.createUser = async (req, res) => {
  const { name, email, password, role, language } = req.body;

  // Extra protection: only super_admin can create other admins or super_admins
  if ((role === 'admin' || role === 'super_admin') && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only Super Admin can create other Admins' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role, language });

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

// הוסף את הפונקציה הזו בסוף הקובץ (לפני ה-exports)
exports.getAllUsers = async (req, res) => {
  try {
    // שולף את כל המשתמשים, אבל מחזיר רק מידע רלוונטי (בלי סיסמאות!)
    const users = await User.find({}).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};