
const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  url:        { type: String, required: true },
  caption:    { type: String, trim: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: true });

const logSlotSchema = new mongoose.Schema({
  tplSlotId: { type: mongoose.Schema.Types.ObjectId, required: true }, // _id dari template slot
  start:     { type: String, required: true },
  end:       { type: String, required: true },
  title:     { type: String, required: true },
  note:      { type: String, trim: true },
  photos:    { type: [photoSchema], default: [] }
});

const ActivityLogSchema = new mongoose.Schema({
  className: { type: String, enum: ['A','B'], required: true },
  date:      { type: Date, required: true },           // TANGGAL HARI ITU (set ke 00:00)
  dayOfWeek: { type: Number, enum: [1,2,3,4,5], required: true },
  templateId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
  slots:     { type: [logSlotSchema], default: [] }
}, { timestamps: true });

ActivityLogSchema.index({ className: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
