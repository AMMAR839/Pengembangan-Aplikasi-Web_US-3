const Student = require('../models/Student');
const supabase = require('../config/supabase');
const path = require('path');

// Hanya field yang boleh diupdate oleh ortu / admin
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
      namaOrangtua: req.body.namaOrangtua,
      noHPOrangtua: req.body.noHPOrangtua,
    };

    if (!data.nik || !data.nama || !data.tanggalLahir || !data.alamat) {
      return res
        .status(400)
        .json({ message: 'nik, nama, tanggalLahir, alamat wajib diisi' });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Foto anak wajib diupload',
      });
    }

    const exists = await Student.exists({ nik: data.nik });
    if (exists) {
      return res.status(409).json({ message: 'NIK sudah terdaftar' });
    }

    // upload foto ke Supabase Storage 
    let photoUrl = null;

    if (req.file) {
      const file = req.file; // dari multer.memoryStorage()
      const ext = path.extname(file.originalname) || '.jpg';
      const fileName = `students/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}${ext}`;

      // upload buffer langsung ke Supabase Storage :contentReference[oaicite:1]{index=1}
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Foto_Student')           // <-- nama bucket di Supabase
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return res.status(500).json({ message: 'Gagal upload foto ke storage' });
      }

      // ambil public URL
      const { data: publicData } = supabase
        .storage
        .from('Foto_Student')
        .getPublicUrl(uploadData.path || fileName);

      photoUrl = publicData.publicUrl; // ini yang kita simpan ke Mongo
    }

    // simpan ke mongodb
    const student = await Student.create({
      ...data,
      parentUserId: req.user._id,
      status: 'pending',
      photoUrl,
    });

    res.status(201).json({ message: 'Siswa terdaftar', student });
  } catch (err) {
    if (err?.code === 11000 && err?.keyPattern?.nik) {
      return res.status(409).json({ message: 'NIK sudah terdaftar' });
    }
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// anka ortu melihat daftar siswa miliknya
exports.listMyStudents = async (req, res) => {
  try {
    const showNik = req.query.showNik === '1';
    const items = await Student.find({ parentUserId: req.user._id })
      .select(
        'nik nama status tanggalLahir alamat kelas golonganDarah jenisKelamin agama photoUrl'
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      items.map((s) => ({
        ...s,
        nik: showNik ? s.nik : maskNik(s.nik),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ortu mengupdate data ank miliknya
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


// Search students (admin only)
exports.searchStudents = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya admin yang bisa search siswa' });
    }

    const { query, status, kelas } = req.query;
    const filter = {};

    // Search by nama or nik
    if (query) {
      filter.$or = [
        { nama: { $regex: query, $options: 'i' } },
        { nik: { $regex: query, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && ['pending', 'active', 'rejected'].includes(status)) {
      filter.status = status;
    }

    // Filter by kelas
    if (kelas && ['A', 'B'].includes(kelas)) {
      filter.kelas = kelas;
    }

    const results = await Student.find(filter)
      .select('nik nama status kelas tanggalLahir NamaOrangtua NoHPOrangtua')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      total: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: list semua siswa
exports.listAllStudents = async (req, res) => {
  try {
    const { status, kelas, search } = req.query;
    const filter = {};

    if (status) filter.status = status; // pending | active | rejected
    if (kelas) filter.kelas = kelas;     // A | B
    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: 'i' } },
        { nik: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Student.find(filter)
      .populate('parentUserId', 'username email')
      .select('nik nama status kelas tanggalLahir parentUserId paymentStatus photoUrl createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Parent: update siswa status (active/rejected/pending)
exports.updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, kelas } = req.body;

    if (!status && !kelas) {
      return res.status(400).json({ message: 'status atau kelas harus diisi' });
    }

    const updates = {};
    if (status && ['pending', 'active', 'rejected'].includes(status)) {
      updates.status = status;
    }
    if (kelas && ['A', 'B', null].includes(kelas)) {
      updates.kelas = kelas;
    }

    const updated = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Siswa tidak ditemukan' });

    res.json({ message: 'Status siswa diupdate', student: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
