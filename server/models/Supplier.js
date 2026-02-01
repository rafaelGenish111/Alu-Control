const mongoose = require('mongoose');
const tenantPlugin = require('../utils/tenantPlugin');

const SupplierSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  contactPerson: { type: String }, // איש קשר
  phone: { type: String },
  email: { type: String },
  leadTime: { type: Number, default: 7 }, // ימי אספקה ממוצעים (לחישוב צפי)
  category: { type: String, enum: ['Aluminum', 'Glass', 'Hardware', 'Other'], default: 'Other' }
}, { timestamps: true });

// Name unique per tenant
SupplierSchema.index({ tenantId: 1, name: 1 }, { unique: true });

SupplierSchema.plugin(tenantPlugin);

module.exports = mongoose.model('Supplier', SupplierSchema);