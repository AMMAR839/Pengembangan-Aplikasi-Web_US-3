const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  noHP: { type: String },
  alamat: String,
  nip: { type: String, unique: true, sparse: true },
  kelas: { type: String, enum: ['A', 'B', null], default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Teacher', teacherSchema);
