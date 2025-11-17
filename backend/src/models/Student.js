const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nik: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    match: [/^\d{16}$/, 'NIK harus 16 digit']
  },
  nama: { type: String, required: true, trim: true },
  tanggalLahir: { type: Date, required: true },
  alamat: { type: String, required: true, trim: true },
  golonganDarah: { type: String, enum: ['A', 'B', 'AB', 'O'] },
  jenisKelamin: { type: String, enum: ['Laki-Laki', 'Perempuan'] },
  agama: { type: String, trim: true },

  namaOrangtua: { type: String, trim: true },
  noHPOrangtua: { type: String, trim: true },

  // Opsional dari form
  alergiMakanan: { type: String, trim: true },
  catatanKesehatan: { type: String, trim: true },
  anakKe: { type: Number },

  // System / admin
  parentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','active','rejected'], default: 'pending' },
  kelas: {
    type: String,
    enum: ['A','B', null],
    default: null,
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
