const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentNik:{ type: String, required: true, index: true },  // ← relasi via NIK
  orderId:   { type: String, required: true, unique: true },
  amount:    { type: Number, required: true },
  status:    { type: String, enum:['pending','settlement','failed','expire','cancel','deny'], default: 'pending' },
  redirectUrl: String
}, { timestamps: true }); 

module.exports = mongoose.model('Payment', paymentSchema);
