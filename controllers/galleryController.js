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


