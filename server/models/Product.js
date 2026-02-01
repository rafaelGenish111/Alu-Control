const mongoose = require('mongoose');
const tenantPlugin = require('../utils/tenantPlugin');

const ProductSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true }, // שם המוצר (למשל: ויטרינה 7000)
  sku: { type: String }, // מק"ט / מס' סידורי
  description: { type: String },
  category: { type: String, required: true }, // קטגוריה (חלונות, דלתות...)
  dimensions: { type: String }, // מידות ברירת מחדל
  color: { type: String }, // צבע ברירת מחדל
  supplier: { type: String }, // שם הספק (טקסט חופשי או בחירה מהרשימה)
}, { timestamps: true });

ProductSchema.plugin(tenantPlugin);

module.exports = mongoose.model('Product', ProductSchema);