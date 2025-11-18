const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const {
  getDashboardStats,
  getAllStudents,
  getAllTeachers,
  getPendingPayments,
  updatePaymentStatus,
  getRecentActivities,
  getAttendanceReport,
} = require('../controllers/adminController');

// All admin routes require admin role
router.use(auth, requireRole('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Students management
router.get('/students', getAllStudents);

// Teachers management
router.get('/teachers', getAllTeachers);

// Payments management
router.get('/payments', getPendingPayments);
router.patch('/payments/:id', updatePaymentStatus);

// Activities
router.get('/activities', getRecentActivities);

// Attendance reports
router.get('/attendance', getAttendanceReport);

module.exports = router;
