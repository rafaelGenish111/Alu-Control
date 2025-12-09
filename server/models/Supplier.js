const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  contactPerson: { type: String }, // איש קשר
  phone: { type: String },
  email: { type: String },
  leadTime: { type: Number, default: 7 }, // ימי אספקה ממוצעים (לחישוב צפי)
  category: { type: String, enum: ['Aluminum', 'Glass', 'Hardware', 'Other'], default: 'Other' }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);