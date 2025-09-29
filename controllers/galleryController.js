// models/Feedback.js
const mongoose = require('mongoose');

exports.uploadPhoto = async (req, res) => {
    try {
        const { caption } = req.body;
        const imageUrl = req.file.path;

        const photo = new Gallery({caption, imageUrl, postedAt});
        await photo.save();

        res.status(201).json({ message: 'Foto berhasil diunggah', photo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


