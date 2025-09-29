const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  activity: { type: String, required: true },
});

module.exports = mongoose.model("Activity", ActivitySchema);
