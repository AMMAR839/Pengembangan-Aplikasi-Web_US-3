const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    parentUserId: { type: String, required: true, ref:'Student'},
    feedback: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback',feedbackSchema);
