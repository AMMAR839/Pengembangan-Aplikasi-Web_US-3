const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Gallery = require('../models/Gallery');
const Message = require('../models/Message');

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Total students
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });
    const pendingStudents = await Student.countDocuments({ status: 'pending' });

    // Total teachers
    const totalTeachers = await Teacher.countDocuments();
    const activeTeachers = await Teacher.countDocuments({ status: 'active' });

    // Total users
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    // Payment stats
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });

    // Attendance stats
    const totalAttendance = await Attendance.countDocuments();
    const presentAttendance = await Attendance.countDocuments({ status: 'hadir' });

    // Get distinct classes
    const classes = await Student.distinct('kelas');
    const totalClasses = classes.filter(k => k !== null).length;

    res.json({
      students: {
        total: totalStudents,
        active: activeStudents,
        pending: pendingStudents,
      },
      teachers: {
        total: totalTeachers,
        active: activeTeachers,
      },
      users: {
        total: totalUsers,
        verified: verifiedUsers,
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        pending: pendingPayments,
        totalRevenue: await Payment.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]).then(r => r[0]?.total || 0),
      },
      attendance: {
        total: totalAttendance,
        present: presentAttendance,
      },
      classes: {
        total: totalClasses,
        list: classes.filter(k => k !== null),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all students (admin view)
exports.getAllStudents = async (req, res) => {
  try {
    const { status, kelas, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (kelas) filter.kelas = kelas;
    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: 'i' } },
        { nik: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(filter)
      .populate('parentUserId', 'username email')
      .select('nik nama status kelas tanggalLahir parentUserId paymentStatus photoUrl createdAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      total: students.length,
      data: students
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all teachers (admin view)
exports.getAllTeachers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nip: { $regex: search, $options: 'i' } }
      ];
    }

    const teachers = await Teacher.find(filter)
      .populate('userId', 'username email')
      .select('nama email noHP nip kelas status createdAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      total: teachers.length,
      data: teachers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get pending payments
exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('studentId', 'nik nama')
      .populate('studentId.parentUserId', 'username email')
      .select('studentId amount paymentMethod status createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      total: payments.length,
      data: payments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update payment status (approve/reject)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['completed', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const payment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });
    }

    // Update student status jika pembayaran approved
    if (status === 'completed') {
      await Student.findByIdAndUpdate(payment.studentId, { paymentStatus: 'completed' });
    }

    res.json({ message: 'Status pembayaran diupdate', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const activities = await Gallery.find()
      .select('title deskripsi createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get attendance report
exports.getAttendanceReport = async (req, res) => {
  try {
    const { kelas, tanggal } = req.query;
    const filter = {};

    if (kelas) filter.kelas = kelas;
    if (tanggal) {
      const startDate = new Date(tanggal);
      const endDate = new Date(tanggal);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'nama')
      .select('studentId status kelas createdAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      total: attendance.length,
      data: attendance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
