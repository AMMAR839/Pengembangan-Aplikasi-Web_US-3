const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const {
  registerStudent,
  listMyStudents,
  updateStudentById,
  searchStudents,
  listAllStudents,
  updateStudentStatus
} = require('../controllers/studentController');

const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(), // BUKAN diskStorage
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// daftar anak: user/parent/admin boleh
router.post('/register', auth, requireRole('user','parent','admin'), upload.single('foto'), registerStudent);

// Admin: list semua siswa (dengan filter)
router.get('/', auth, requireRole('admin'), listAllStudents);

// lihat anak saya: khusus parent/admin (setelah bayar jadi parent)
router.get('/my', auth, requireRole('parent','admin'), listMyStudents);

// search students: admin only
router.get('/search', auth, requireRole('admin'), searchStudents);

// update biodata anak by _id: khusus parent/admin
router.patch('/:id', auth, requireRole('parent','admin'), updateStudentById);

// Admin: update student status / kelas
router.patch('/:id/status', auth, requireRole('admin'), updateStudentStatus);

module.exports = router;
