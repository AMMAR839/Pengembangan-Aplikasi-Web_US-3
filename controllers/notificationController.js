const Notification = require('../models/Notification');
const emitter = require('../events/notifications');

// Admin/guru membuat notifikasi
exports.createNotification = async (req, res) => {
  try {
    const { title, body, audience = 'all', recipients = [] } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'title dan body wajib diisi' });
    }
    if (!['all','parents','byUser'].includes(audience)) {
      return res.status(400).json({ message: 'audience tidak valid' });
    }
    if (audience === 'byUser' && (!Array.isArray(recipients) || recipients.length === 0)) {
      return res.status(400).json({ message: 'recipients wajib diisi jika audience=byUser' });
    }

    const notif = await Notification.create({
      title,
      body,
      audience,
      recipients: audience === 'byUser' ? recipients : [],
      createdBy: req.user._id
    });

    // Kirim event untuk client SSE
    emitter.emit('notification:new', {
      _id: notif._id,
      title: notif.title,
      body: notif.body,
      audience: notif.audience,
      recipients: notif.recipients,
      createdAt: notif.createdAt
    });

    res.status(201).json({ message: 'Notifikasi dibuat', data: notif });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// User/Parent melihat notifikasi yang relevan
exports.listMyNotifications = async (req, res) => {
  try {
    const orConditions = [
      { audience: 'all' },
      { audience: 'byUser', recipients: req.user._id }
    ];
    if (req.user.role === 'parent') {
      orConditions.push({ audience: 'parents' });
    }

    const items = await Notification.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .lean();

    const myId = String(req.user._id);
    const mapped = items.map(n => ({
      _id: n._id,
      title: n.title,
      body: n.body,
      audience: n.audience,
      createdAt: n.createdAt,
      isRead: Array.isArray(n.readBy) ? n.readBy.some(id => String(id) === myId) : false
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tandai 1 notifikasi sebagai dibaca
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: req.user._id } }, // idempotent
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    res.json({ message: 'Ditandai sebagai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin lihat semua notifikasi
exports.listAllNotifications = async (req, res) => {
  try {
    const items = await Notification.find()
      .populate('createdBy', 'username')
      .populate('recipients', 'username')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Stream realtime (SSE) - opsional
exports.stream = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const userId = String(req.user._id);
  const userRole = req.user.role;

  const onNew = (notif) => {
    const allowed =
      notif.audience === 'all' ||
      (notif.audience === 'parents' && userRole === 'parent') ||
      (notif.audience === 'byUser' && Array.isArray(notif.recipients) && notif.recipients.some(id => String(id) === userId));

    if (allowed) {
      res.write(`data: ${JSON.stringify({ type: 'notification:new', data: notif })}\n\n`);
    }
  };

  emitter.on('notification:new', onNew);

  const keepAlive = setInterval(() => {
    res.write('event: ping\ndata: {}\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    emitter.off('notification:new', onNew);
    res.end();
  });
};
