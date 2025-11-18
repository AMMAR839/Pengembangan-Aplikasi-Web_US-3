const Gallery = require('../models/Gallery');

exports.getAllPhotos = async (req, res) => {
  try {
    const photos = await Gallery.find({ isVisible: true });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchPhotosByCaption = async (req, res) => {
  try {
    const { caption } = req.query;
    if (!caption) {
      return res.status(400).json({ message: "Caption harus diisi" });
    }

    const photos = await Gallery.find({
      caption: { $regex: caption, $options: "i" } // i = case insensitive
    });

    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleVisibility = async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: "Foto tidak ditemukan" });

    photo.isVisible = !photo.isVisible;
    await photo.save();

    res.json({ message: "Status berhasil diubah", photo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file provided');
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    const { caption } = req.body;
    const imageUrl = `/uploads/gallery/${req.file.filename}`;

    console.log('Creating gallery entry:', { caption, imageUrl });
    
    const newPhoto = await Gallery.create({
      caption: caption || "Tanpa caption",
      imageUrl,
    });

    console.log('Gallery entry created:', newPhoto);

    // Emit real-time event ke semua clients via Socket.IO
    const io = req.app.locals.io;
    if (io) {
      console.log('Emitting photo_uploaded event');
      io.emit('photo_uploaded', {
        id: newPhoto._id,
        caption: newPhoto.caption,
        imageUrl: newPhoto.imageUrl,
        createdAt: newPhoto.createdAt
      });
    }

    res.status(201).json({ message: "Foto berhasil diupload", photo: newPhoto });
  } catch (err) {
    console.error('Gallery upload error:', err);
    res.status(500).json({ error: err.message });
  }
};
