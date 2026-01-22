const Repair = require('../models/Repair');
const Order = require('../models/Order');

exports.createRepair = async (req, res) => {
  const { manualOrderNumber, contactedAt, problem, estimatedWorkDays, warrantyStatus, paymentNote, clientName, clientPhone, clientAddress, region, hora } = req.body;
  const userName = req.user ? req.user.name : 'System';

  try {
    if (!problem || !String(problem).trim()) {
      return res.status(400).json({ message: 'Problem is required' });
    }
    if (!clientName || !String(clientName).trim()) {
      return res.status(400).json({ message: 'Client name is required' });
    }

    const dt = contactedAt ? new Date(contactedAt) : new Date();
    if (Number.isNaN(dt.getTime())) {
      return res.status(400).json({ message: 'Invalid contactedAt date' });
    }

    const orderNumberStr = manualOrderNumber ? String(manualOrderNumber).trim() : null;
    const order = orderNumberStr ? await Order.findOne({ manualOrderNumber: orderNumberStr }) : null;
    
    const repair = new Repair({
      orderId: order ? order._id : null,
      manualOrderNumber: orderNumberStr || null,
      clientName: String(clientName).trim(),
      clientPhone: clientPhone ? String(clientPhone).trim() : '',
      clientAddress: clientAddress ? String(clientAddress).trim() : '',
      region: region ? String(region).trim() : '',
      contactedAt: dt,
      problem: String(problem).trim(),
      warrantyStatus: warrantyStatus === 'out_of_warranty' ? 'out_of_warranty' : 'in_warranty',
      paymentNote: typeof paymentNote === 'string' ? paymentNote.trim() : '',
      estimatedWorkDays: Number.isFinite(Number(estimatedWorkDays)) ? Number(estimatedWorkDays) : 1,
      hora: typeof hora === 'string' ? hora.trim() : null,
      status: 'open',
      notes: [{ text: 'Repair ticket created', createdAt: new Date(), createdBy: userName }]
    });

    const saved = await repair.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRepairs = async (req, res) => {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) {
      const qq = String(q).trim();
      filter.$or = [
        { manualOrderNumber: { $regex: qq, $options: 'i' } },
        { clientName: { $regex: qq, $options: 'i' } },
        { problem: { $regex: qq, $options: 'i' } }
      ];
    }

    const repairs = await Repair.find(filter).sort({ createdAt: -1 });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRepairById = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRepair = async (req, res) => {
  const userName = req.user ? req.user.name : 'System';
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    const { contactedAt, problem, estimatedWorkDays, warrantyStatus, paymentNote, manualOrderNumber, clientPhone, clientAddress, hora, installers, finalInvoice, status } = req.body;

    if (typeof problem === 'string') repair.problem = problem.trim();
    if (typeof warrantyStatus === 'string') {
      repair.warrantyStatus = warrantyStatus === 'out_of_warranty' ? 'out_of_warranty' : 'in_warranty';
    }
    if (typeof paymentNote === 'string') repair.paymentNote = paymentNote.trim();
    if (typeof clientPhone === 'string') repair.clientPhone = clientPhone.trim();
    if (typeof clientAddress === 'string') repair.clientAddress = clientAddress.trim();
    if (typeof hora === 'string') repair.hora = hora.trim();
    if (typeof hora === 'undefined' || hora === null) repair.hora = null;
    if (Array.isArray(installers)) {
      repair.installers = installers;
    }
    if (typeof status === 'string' && ['open', 'ready_to_schedule', 'scheduled', 'in_progress', 'pending_approval', 'completed', 'closed'].includes(status)) {
      repair.status = status;
    }
    if (finalInvoice && typeof finalInvoice === 'object') {
      repair.finalInvoice = {
        isIssued: Boolean(finalInvoice.isIssued),
        invoiceNumber: typeof finalInvoice.invoiceNumber === 'string' ? finalInvoice.invoiceNumber : '',
        amount: typeof finalInvoice.amount === 'number' ? finalInvoice.amount : undefined,
        isPaid: Boolean(finalInvoice.isPaid)
      };
    }
    if (contactedAt) {
      const dt = new Date(contactedAt);
      if (!Number.isNaN(dt.getTime())) repair.contactedAt = dt;
    }
    if (typeof estimatedWorkDays !== 'undefined') {
      const n = Number(estimatedWorkDays);
      if (Number.isFinite(n)) repair.estimatedWorkDays = n;
    }
    if (typeof manualOrderNumber !== 'undefined') {
      const orderNumberStr = manualOrderNumber ? String(manualOrderNumber).trim() : null;
      repair.manualOrderNumber = orderNumberStr || null;
      // Try to find matching order
      const order = orderNumberStr ? await Order.findOne({ manualOrderNumber: orderNumberStr }) : null;
      repair.orderId = order ? order._id : null;
    }

    repair.notes.push({ text: 'Repair updated', createdAt: new Date(), createdBy: userName });
    const saved = await repair.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addRepairNote = async (req, res) => {
  const { text } = req.body;
  const userName = req.user ? req.user.name : 'System';

  try {
    if (!text || !String(text).trim()) return res.status(400).json({ message: 'Text is required' });
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    repair.notes.push({ text: String(text).trim(), createdAt: new Date(), createdBy: userName });
    const saved = await repair.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addRepairMedia = async (req, res) => {
  const { url, type, name } = req.body;
  const userName = req.user ? req.user.name : 'System';

  try {
    if (!url) return res.status(400).json({ message: 'URL is required' });
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    repair.media.push({
      url,
      type: ['photo', 'video', 'document'].includes(type) ? type : 'photo',
      name: name || '',
      createdAt: new Date(),
      createdBy: userName
    });

    const saved = await repair.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveRepair = async (req, res) => {
  const userName = req.user ? req.user.name : 'System';
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    repair.status = 'ready_to_schedule';
    repair.notes.push({ text: 'Approved to scheduling', createdAt: new Date(), createdBy: userName });
    const saved = await repair.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.scheduleRepair = async (req, res) => {
  const { installerIds, startDate, endDate, notes } = req.body;
  const userName = req.user ? req.user.name : 'System';

  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    if (!Array.isArray(installerIds) || installerIds.length === 0) {
      return res.status(400).json({ message: 'installerIds required' });
    }

    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
      return res.status(400).json({ message: 'Invalid dates' });
    }

    repair.installers = installerIds;
    repair.installDateStart = sd;
    repair.installDateEnd = ed;
    repair.schedulingNotes = typeof notes === 'string' ? notes : '';
    repair.status = 'scheduled';
    repair.notes.push({ text: 'Scheduled', createdAt: new Date(), createdBy: userName });

    const saved = await repair.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.closeRepair = async (req, res) => {
  const userName = req.user ? req.user.name : 'System';
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    // If installer closes, move to pending_approval instead of closed
    // This allows financial team to review and either skip to completed or process normally
    repair.status = 'pending_approval';
    repair.notes.push({ text: 'Closed', createdAt: new Date(), createdBy: userName });
    const saved = await repair.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRepairIssue = async (req, res) => {
  const { isIssue, reason } = req.body;
  const userName = req.user ? req.user.name : 'System';

  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    const nextIsIssue = Boolean(isIssue);
    if (nextIsIssue) {
      repair.issue = {
        isIssue: true,
        reason: typeof reason === 'string' ? reason.trim() : '',
        createdAt: new Date(),
        createdBy: userName,
        resolvedAt: null
      };
      repair.notes.push({ text: `Marked as issue${repair.issue.reason ? `: ${repair.issue.reason}` : ''}`, createdAt: new Date(), createdBy: userName });
    } else {
      repair.issue = { ...(repair.issue || {}), isIssue: false, resolvedAt: new Date() };
      repair.notes.push({ text: 'Issue resolved', createdAt: new Date(), createdBy: userName });
    }

    const saved = await repair.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRepairTakeList = async (req, res) => {
  const { installTakeList } = req.body;
  const userName = req.user ? req.user.name : 'System';

  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair not found' });

    if (Array.isArray(installTakeList)) {
      repair.installTakeList = installTakeList.map(item => ({
        label: typeof item.label === 'string' ? item.label.trim() : String(item.label || ''),
        done: Boolean(item.done)
      }));
      repair.notes.push({ text: 'Install take list updated', createdAt: new Date(), createdBy: userName });
    }

    const saved = await repair.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



