const Product = require('../models/Product');

const tenantOpts = (req) => (req.tenantId ? { tenantId: req.tenantId } : {});

// שליפת כל המוצרים
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).setOptions(tenantOpts(req)).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// יצירת מוצר חדש
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, tenantId: req.tenantId });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// מחיקת מוצר
exports.deleteProduct = async (req, res) => {
  try {
    await Product.deleteOne({ _id: req.params.id, tenantId: req.tenantId });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};