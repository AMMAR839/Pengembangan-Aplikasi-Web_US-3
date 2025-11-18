const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const {
  registerStudent,
  listMyStudents,
  updateStudentById,
  searchStudents
} = require('../controllers/studentController');

// daftar anak: user/parent/admin boleh
router.post('/register', auth, requireRole('user','parent','admin'), registerStudent);

// lihat anak saya: khusus parent/admin (setelah bayar jadi parent)
router.get('/my', auth, requireRole('parent','admin'), listMyStudents);

// search students: admin only
router.get('/search', auth, requireRole('admin'), searchStudents);

// update biodata anak by _id: khusus parent/admin
router.patch('/:id', auth, requireRole('parent','admin'), updateStudentById);

module.exports = router;
