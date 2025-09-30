const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    caption: { type: String, required: true, ref},
    imageUrl: { type: String, required: true },
    postedAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Gallery', gallerySchema);

