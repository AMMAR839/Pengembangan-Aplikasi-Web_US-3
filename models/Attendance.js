const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Hadir", "Tidak Hadir", "Izin"], required: true },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
