const Order = require('../models/Order');

// 1. Get all orders (with basic sorting)
exports.getOrders = async (req, res) => {
  try {
    // newest first
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Create a new order
exports.createOrder = async (req, res) => {
  const { clientName, clientPhone, clientEmail, clientAddress, workflow, items } = req.body;

  try {
    // Generate automatic order number (e.g. 1001, 1002...)
    const count = await Order.countDocuments();
    const orderNumber = 1000 + count + 1;

    const order = new Order({
      orderNumber,
      clientName,
      clientPhone,
      clientEmail,
      clientAddress,
      workflow,
      items, // array of items (windows, showcases, etc.)
      status: 'production' // initial status
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 3. Update order status
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get purchasing list (grouped by supplier)
exports.getBatchingList = async (req, res) => {
  try {
    const pipeline = [
      // 1. Filter: only active orders (exclude offers and completed)
      { $match: { status: { $nin: ['offer', 'completed'] } } },

      // 2. Unwind items so each item becomes its own row
      { $unwind: "$items" },

      // 3. Filter items: keep only ones that are not yet ordered
      { $match: { "items.isOrdered": false } },

      // 4. Group by supplier name
      {
        $group: {
          _id: "$items.supplier",
          totalItems: { $sum: 1 },
          items: {
            $push: {
              description: "$items.description",
              productType: "$items.productType",
              clientName: "$clientName",
              orderNumber: "$orderNumber",
              orderId: "$_id",
              itemId: "$items._id"
            }
          }
        }
      }
    ];

    const batchList = await Order.aggregate(pipeline);
    res.json(batchList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Mark items as ordered for a given supplier
exports.markAsOrdered = async (req, res) => {
  const { supplier } = req.body;

  try {
    // Smart update: find every order with items for this supplier that are not ordered yet and mark them ordered
    await Order.updateMany(
      { "items.supplier": supplier, "items.isOrdered": false },
      { $set: { "items.$[elem].isOrdered": true } },
      { arrayFilters: [{ "elem.supplier": supplier, "elem.isOrdered": false }] }
    );

    res.json({ message: `All items for ${supplier} marked as ordered` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addFileToOrder = async (req, res) => {
  const { url, fileType } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.files.push({ url, fileType });
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 7. Add a file to an order (save link in DB)
exports.addOrderFile = async (req, res) => {
  const { url, type, name } = req.body; // receive file link and metadata from client

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // push into the files array
    order.files.push({
      url,
      type: type || 'photo',
      name: name || 'Uploaded File',
      uploadedAt: new Date()
    });

    await order.save();
    res.json(order); // return updated order
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 8. Get customers list (group by client name)
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$clientName", // group by client name
          phone: { $first: "$clientPhone" }, // take phone from first matching order
          address: { $first: "$clientAddress" },
          lastOrderDate: { $max: "$createdAt" },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { lastOrderDate: -1 } } // show most recently active customers first
    ]);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 9. Get order history for a specific customer
exports.getClientHistory = async (req, res) => {
  // name comes from URL – decoded so spaces and non-ASCII names are handled correctly
  const clientName = decodeURIComponent(req.params.name);

  try {
    const orders = await Order.find({ clientName: clientName }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClientByPhone = async (req, res) => {
  const { phone } = req.params;
  try {
    // Take the newest order for this phone number
    const existingOrder = await Order.findOne({ clientPhone: phone }).sort({ createdAt: -1 });

    if (existingOrder) {
      res.json({
        found: true,
        clientName: existingOrder.clientName,
        clientAddress: existingOrder.clientAddress,
        clientEmail: existingOrder.clientEmail
      });
    } else {
      res.json({ found: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};