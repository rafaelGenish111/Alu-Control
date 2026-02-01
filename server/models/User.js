const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const tenantPlugin = require('../utils/tenantPlugin');

const UserSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'office', 'production', 'installer'],
    default: 'installer'
  },
  language: { type: String, enum: ['en', 'es', 'he'], default: 'en' },
}, { timestamps: true });

// Email unique per tenant
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

UserSchema.plugin(tenantPlugin);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper to compare a given password with the stored hash
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);