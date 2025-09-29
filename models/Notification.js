const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body:  { type: String, required: true, trim: true },

  // Target audiens
  audience: { type: String, enum: ['all', 'parents', 'byUser'], default: 'all' },

  // Jika audience=byUser, isi daftar penerima userId
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Pembuat (admin/guru)
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Siapa saja yang sudah membaca
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

notificationSchema.index({ audience: 1, createdAt: -1 });
notificationSchema.index({ recipients: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
