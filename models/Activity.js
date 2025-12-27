const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  day: { type: String, required: true },
  activity: { type: String, required: true },
});

module.exports = mongoose.model("Activity", ActivitySchema);
