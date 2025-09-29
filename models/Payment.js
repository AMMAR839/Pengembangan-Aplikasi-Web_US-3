const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentNIK: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  orderId: String,
  amount: Number,
  status: { type: String, enum: ['pending','settlement','failed'], default: 'pending' }
});

module.exports = mongoose.model('Payment', paymentSchema);
