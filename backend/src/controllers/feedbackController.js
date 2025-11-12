const Feedback = require('../models/Feedback');

// Parent kirim feedback 
exports.submitFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;
    if (!feedback || !String(feedback).trim()) {
      return res.status(400).json({ message: 'feedback wajib diisi' });
    }

    const doc = await Feedback.create({
      parentUserId: req.user._id,
      feedback: String(feedback).trim()
    });

    res.status(201).json({ message: 'Feedback terkirim', data: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin/Teacher lihat semua feedback (opsional filter by tanggal / parent)
exports.listFeedback = async (req, res) => {
  try {
    const { from, to, parentId } = req.query;

    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }
    if (parentId) filter.parentUserId = parentId;

    const items = await Feedback.find(filter)
      .populate('parentUserId', 'username')
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Parent lihat feedback yang pernah dia kirim
exports.listMyFeedback = async (req, res) => {
  try {
    const items = await Feedback.find({ parentUserId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
