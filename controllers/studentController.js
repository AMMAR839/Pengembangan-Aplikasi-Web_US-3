const Student = require('../models/Student');

// Hanya field ini yang boleh diubah (tanpa NIK, status, parentUserId)
const ALLOWED = new Set([
  'nama','tanggalLahir','alamat',
  'golonganDarah','jenisKelamin','agama',
  'NamaOrangtua','NoHPOrangtua'
]);

const pickAllowed = (body = {}) => {
  const out = {};
  for (const [k, v] of Object.entries(body)) if (ALLOWED.has(k)) out[k] = v;
  return out;
};

const maskNik = (nik) => {
  if (!nik || nik.length < 8) return nik;
  return nik.slice(0,4) + '*'.repeat(nik.length-8) + nik.slice(-4);
};

// ===== Create (daftar siswa) =====
exports.registerStudent = async (req, res) => {
  try {
    const data = {
      nik: req.body.nik,
      nama: req.body.nama,
      tanggalLahir: req.body.tanggalLahir,
      alamat: req.body.alamat,
      golonganDarah: req.body.golonganDarah,
      jenisKelamin: req.body.jenisKelamin,
      agama: req.body.agama,
      NamaOrangtua: req.body.NamaOrangtua,
      NoHPOrangtua: req.body.NoHPOrangtua,
    };

    if (!data.nik || !data.nama || !data.tanggalLahir || !data.alamat) {
      return res.status(400).json({ message: 'nik, nama, tanggalLahir, alamat wajib diisi' });
    }

    const exists = await Student.exists({ nik: data.nik });
    if (exists) return res.status(409).json({ message: 'NIK sudah terdaftar' });

    const student = await Student.create({
      ...data,
      parentUserId: req.user._id,
      status: 'pending'
    });

    res.status(201).json({ message: 'Siswa terdaftar', student });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.nik) {
      return res.status(409).json({ message: 'NIK sudah terdaftar' });
    }
    res.status(500).json({ message: err.message });
  }
};

// ===== List anak milik user (default NIK masked; ?showNik=1 untuk full) =====
exports.listMyStudents = async (req, res) => {
  try {
    const showNik = req.query.showNik === '1';
    const items = await Student.find({ parentUserId: req.user._id })
      .select('nik nama status tanggalLahir alamat')
      .sort({ createdAt: -1 })
      .lean();

    res.json(items.map(s => ({
      ...s,
      nik: showNik ? s.nik : maskNik(s.nik)
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== Update by _id (ortu pemilik / admin) =====
exports.updateStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = pickAllowed(req.body);
    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'Tidak ada field yang bisa diupdate' });
    }

    const isAdmin = req.user.role === 'admin';
    const filter = isAdmin ? { _id: id } : { _id: id, parentUserId: req.user._id };

    const updated = await Student.findOneAndUpdate(
      filter,
      { $set: updates },
      { new: true, runValidators: true, context: 'query' }
    );
    if (!updated) return res.status(404).json({ message: 'Data siswa tidak ditemukan / bukan milik Anda' });

    res.json({ message: 'Data siswa berhasil diupdate', student: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
