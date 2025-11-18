const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// All admin routes are protected with authentication and admin role
router.use(auth);
router.use(requireRole('admin'));

// Dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// Student management
router.get('/students', adminController.getAllStudents);

// Teacher management
router.get('/teachers', adminController.getAllTeachers);

// Payment management
router.get('/payments', adminController.getPendingPayments);
router.patch('/payments/:id', adminController.updatePaymentStatus);

// Activity logs
router.get('/activities', adminController.getRecentActivities);

// Attendance reports
router.get('/attendance', adminController.getAttendanceReport);

// Notifications
router.get('/notifications/count', adminController.getNotificationsCount);

module.exports = router;
