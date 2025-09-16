const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nama: String,
  tanggalLahir: Date,
  alamat: String,
  parentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','active'], default: 'pending' }
});

module.exports = mongoose.model('Student', studentSchema);
