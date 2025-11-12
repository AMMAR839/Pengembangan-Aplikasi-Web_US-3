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
  NamaOrangtua: { type: String, trim: true },
  NoHPOrangtua: { type: String, trim: true },
  parentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','active'], default: 'pending' },
  kelas: { type: String, enum: ['A','B','null'], default: 'null', index: true,required: false }, 
});

module.exports = mongoose.model('Student', studentSchema);
