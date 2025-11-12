
const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  start: { type: String, required: true, match: [/^\d{2}:\d{2}$/, 'start harus HH:MM'] },
  end:   { type: String, required: true, match: [/^\d{2}:\d{2}$/, 'end harus HH:MM'] },
  title: { type: String, required: true },
  note:  { type: String, trim: true }
  
});

const ActivitySchema = new mongoose.Schema({
  className: { type: String, enum: ['A','B'], required: true },
  dayOfWeek: { type: Number, enum: [1,2,3,4,5], required: true }, // 1=Senin .. 5=Jumat
  slots:     { type: [slotSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ActivitySchema.index({ className: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model("Activity", ActivitySchema);
