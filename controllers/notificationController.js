const Notification = require('../models/Notification');
const emitter = require('../events/notifications'); 
const User = require('../models/User');
const Student = require('../models/Student');


exports.createNotification = async (req, res) => {
  try {
    let {
      title,
      body,
      audience = 'all',
      recipients = [],
      recipientUsernames = [],
      studentId
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'title dan body wajib diisi' });
    }
    if (!['all','parents','byUser'].includes(audience)) {
      return res.status(400).json({ message: 'audience tidak valid' });
    }

    // Kumpulkan semua target userId di sini
    let resolvedIds = [];

    // Jika ada username, resolve ke _id
    if (Array.isArray(recipientUsernames) && recipientUsernames.length) {
      const users = await User.find({ username: { $in: recipientUsernames } })
        .select('_id username')
        .lean();

      const foundUsernames = new Set(users.map(u => u.username));
      const notFound = recipientUsernames.filter(u => !foundUsernames.has(u));
      if (notFound.length) {
        return res.status(404).json({ message: 'Sebagian username tidak ditemukan', notFound });
      }

      resolvedIds.push(...users.map(u => u._id));
      // Kalau kirim username, audience otomatis byUser
      audience = 'byUser';
    }

    // Jika ada studentId, kirim ke parentUserId siswa tsb
    if (studentId) {
      const stu = await Student.findById(studentId).select('parentUserId').lean();
      if (!stu || !stu.parentUserId) {
        return res.status(404).json({ message: 'Parent user tidak ditemukan untuk studentId tersebut' });
      }
      resolvedIds.push(stu.parentUserId);
      audience = 'byUser';
    }

    // Tambahkan recipients dari body (userId langsung)
    if (Array.isArray(recipients) && recipients.length) {
      resolvedIds.push(...recipients);
      audience = 'byUser';
    }

    // Deduplicate
    resolvedIds = [...new Set(resolvedIds.map(String))];

    // Validasi kalau audience byUser tapi daftar kosong
    if (audience === 'byUser' && resolvedIds.length === 0) {
      return res.status(400).json({ message: 'recipients wajib diisi jika audience=byUser (atau pakai recipientUsernames / studentId)' });
    }

    const notif = await Notification.create({
      title,
      body,
      audience,
      recipients: audience === 'byUser' ? resolvedIds : [],
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

// Stream realtime (SSE) 
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
