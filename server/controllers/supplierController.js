const Supplier = require('../models/Supplier');

// קבלת כל הספקים (פתוח לכולם כדי שיוכלו לבחור בהזמנה)
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// יצירת ספק חדש (רק לסופר אדמין)
exports.createSupplier = async (req, res) => {
  const { name, contactPerson, phone, email, leadTime, category } = req.body;
  try {
    const exists = await Supplier.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Supplier already exists' });

    const supplier = await Supplier.create({
      name, contactPerson, phone, email, leadTime, category
    });
    
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// עדכון ספק
exports.updateSupplier = async (req, res) => {
  const { name, contactPerson, phone, email, leadTime, category } = req.body;
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    if (name && name !== supplier.name) {
      const exists = await Supplier.findOne({ name });
      if (exists) return res.status(400).json({ message: 'Supplier name already exists' });
      supplier.name = name;
    }
    if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
    if (phone !== undefined) supplier.phone = phone;
    if (email !== undefined) supplier.email = email;
    if (leadTime !== undefined) supplier.leadTime = leadTime;
    if (category !== undefined) supplier.category = category;

    const updated = await supplier.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// מחיקת ספק
exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};