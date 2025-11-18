const Teacher = require('../models/Teacher');
const User = require('../models/User');

// Create teacher (admin only)
exports.createTeacher = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa membuat data guru' });
    }

    const { nama, email, noHP, alamat, nip, kelas } = req.body;

    if (!nama || !email) {
      return res.status(400).json({ message: 'Nama dan email wajib diisi' });
    }

    const exists = await Teacher.findOne({ $or: [{ email }, { nip: nip || null }] });
    if (exists) {
      return res.status(409).json({ message: 'Email atau NIP sudah terdaftar' });
    }

    const teacher = await Teacher.create({
      nama,
      email,
      noHP: noHP || '',
      alamat: alamat || '',
      nip: nip || null,
      kelas: kelas || null,
      status: 'active'
    });

    res.status(201).json({ message: 'Data guru berhasil dibuat', data: teacher });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all teachers (admin only)
exports.listTeachers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa melihat daftar guru' });
    }

    const { status, kelas } = req.query;
    const filter = {};

    if (status && ['active', 'inactive'].includes(status)) {
      filter.status = status;
    }

    if (kelas && ['A', 'B'].includes(kelas)) {
      filter.kelas = kelas;
    }

    const teachers = await Teacher.find(filter)
      .populate('userId', 'username role')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      total: teachers.length,
      data: teachers
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get teacher by ID
exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id)
      .populate('userId', 'username role');

    if (!teacher) {
      return res.status(404).json({ message: 'Data guru tidak ditemukan' });
    }

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update teacher (admin only)
exports.updateTeacher = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa mengupdate data guru' });
    }

    const { id } = req.params;
    const { nama, email, noHP, alamat, kelas, status } = req.body;

    const updates = {};
    if (nama) updates.nama = nama;
    if (email) updates.email = email;
    if (noHP !== undefined) updates.noHP = noHP;
    if (alamat !== undefined) updates.alamat = alamat;
    if (kelas) updates.kelas = kelas;
    if (status) updates.status = status;
    updates.updatedAt = Date.now();

    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'username role');

    if (!teacher) {
      return res.status(404).json({ message: 'Data guru tidak ditemukan' });
    }

    res.json({ message: 'Data guru berhasil diupdate', data: teacher });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete teacher (admin only)
exports.deleteTeacher = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa menghapus data guru' });
    }

    const { id } = req.params;
    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return res.status(404).json({ message: 'Data guru tidak ditemukan' });
    }

    res.json({ message: 'Data guru berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search teachers
exports.searchTeachers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa search guru' });
    }

    const { query, status, kelas } = req.query;
    const filter = {};

    if (query) {
      filter.$or = [
        { nama: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { nip: { $regex: query, $options: 'i' } }
      ];
    }

    if (status && ['active', 'inactive'].includes(status)) {
      filter.status = status;
    }

    if (kelas && ['A', 'B'].includes(kelas)) {
      filter.kelas = kelas;
    }

    const results = await Teacher.find(filter)
      .populate('userId', 'username role')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      total: results.length,
      data: results
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
