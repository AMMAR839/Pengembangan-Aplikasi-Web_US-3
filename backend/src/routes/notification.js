const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const {
  createNotification,
  listMyNotifications,
  markAsRead,
  listAllNotifications,
  stream
} = require('../controllers/notificationController');

// Buat notifikasi (admin/guru saja)
router.post('/', auth, requireRole('admin'), createNotification);

// User/parent ambil notifikasi miliknya
router.get('/my', auth, listMyNotifications);

// Tandai sudah dibaca
router.patch('/:id/read', auth, markAsRead);

// Admin lihat semua
router.get('/', auth, requireRole('admin'), listAllNotifications);

// Realtime SSE (opsional; tetap butuh auth)
router.get('/stream', auth, stream);

module.exports = router;
