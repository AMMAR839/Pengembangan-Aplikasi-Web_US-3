const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({
    caption: { type: String, required: true},
    imageUrl: { type: String, required: true },
    postedAt: { type: Date, default: Date.now },
    isVisible: { type: Boolean, default: false }

});

module.exports = mongoose.model('Gallery', GallerySchema);
