const Order = require('../models/Order');
const User = require('../models/User');

// 1. Assign Team & Schedule (שיבוץ עובדים ותאריכים)
exports.scheduleInstallation = async (req, res) => {
  const { orderId, installerIds, startDate, endDate, notes } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Update fields
    order.installers = installerIds || []; // Array of User IDs
    order.installDateStart = new Date(startDate);
    order.installDateEnd = new Date(endDate);
    order.installationNotes = notes;

    // Move to 'scheduled' if installers assigned, otherwise 'in_progress'
    order.status = (installerIds && installerIds.length > 0) ? 'scheduled' : 'in_progress';

    // Add to timeline
    const installerCount = installerIds ? installerIds.length : 0;
    order.timeline.push({
      status: order.status,
      note: installerCount > 0 
        ? `Scheduled for ${new Date(startDate).toLocaleDateString()} with ${installerCount} installers.`
        : `Scheduled for ${new Date(startDate).toLocaleDateString()} (no installers assigned yet).`
    });

    await order.save();

    // Populate installer names for the response
    await order.populate('installers', 'name role');

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get Installers List (שליפת רק עובדים שהם מתקינים לטובת ה-Dropdown)
exports.getInstallersList = async (req, res) => {
  try {
    const installers = await User.find({ role: 'installer' }).select('name _id email');
    res.json(installers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Manager Approval (אישור סופי של המנהל אחרי שהמתקין סיים)
exports.approveInstallation = async (req, res) => {
  const { orderId } = req.body;
  try {
    // Installation is already finished by installer app -> pending_approval.
    // Keep this endpoint for backwards compatibility with older UIs.
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'pending_approval' },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Update Installers and Installation Dates (עדכון מתקינים ותאריכים בלבד)
exports.updateInstallers = async (req, res) => {
  const { installerIds, startDate, endDate } = req.body;
  const userName = req.user ? req.user.name : 'System';

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (Array.isArray(installerIds)) {
      order.installers = installerIds;
    }

    if (startDate) {
      order.installDateStart = new Date(startDate);
    }

    if (endDate) {
      order.installDateEnd = new Date(endDate);
    }

    // Update status if needed
    if (order.installDateStart && order.installDateEnd) {
      if (order.status === 'ready_for_install' || order.status === 'in_progress') {
        order.status = order.installers && order.installers.length > 0 ? 'scheduled' : 'in_progress';
      }
    }

    order.timeline.push({
      status: order.status,
      note: 'Installers and dates updated',
      date: new Date(),
      user: userName
    });

    const saved = await order.save();
    await saved.populate('installers', 'name role');
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};