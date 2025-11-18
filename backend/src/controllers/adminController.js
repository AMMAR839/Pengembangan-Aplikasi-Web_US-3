const Student = require('../models/Student');
const Teacher = require('../models/User'); // Teachers are stored as users with role 'teacher'
const User = require('../models/User');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Activity = require('../models/Activity');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalUsers = await User.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const completedPayments = await Payment.countDocuments({ status: 'approved' });
    const totalAttendance = await Attendance.countDocuments();
    
    // Calculate total revenue from completed payments
    const revenueData = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    res.json({
      totalStudents,
      totalTeachers,
      totalUsers,
      totalPayments,
      pendingPayments,
      completedPayments,
      totalRevenue,
      totalAttendance
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Get all students with pagination and filters
exports.getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all'; // all | pending | active | rejected
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (status !== 'all') {
      filter.status = status;
    }
    
    const students = await Student.find(filter)
      .populate('parentUserId')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await Student.countDocuments(filter);
    
    res.json({
      students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalStudents: total,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const search = req.query.search || '';
    const teachers = await User.find({
      role: 'teacher',
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    });
    
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

// Get pending payments
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('studentId')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // approved | rejected
    
    const payment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('studentId');
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update student payment status if approved
    if (status === 'approved' && payment.studentId) {
      await Student.findByIdAndUpdate(
        payment.studentId._id,
        { paymentStatus: 'paid' }
      );
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const activities = await Activity.find()
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

// Get attendance report
exports.getAttendanceReport = async (req, res) => {
  try {
    const { classroom, date } = req.query;
    let filter = {};
    
    if (classroom) {
      filter.classroom = classroom;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }
    
    const attendance = await Attendance.find(filter)
      .populate('studentId')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({ error: 'Failed to fetch attendance report' });
  }
};

// Get notifications count
exports.getNotificationsCount = async (req, res) => {
  try {
    const notificationsCount = await Notification.countDocuments({ read: false });
    res.json({ unreadCount: notificationsCount });
  } catch (error) {
    console.error('Error fetching notifications count:', error);
    res.status(500).json({ error: 'Failed to fetch notifications count' });
  }
};
