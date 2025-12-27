const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { parentId, studentId, content } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Hanya guru/admin yang bisa mengirim pesan' });
    }

    const msg = await Message.create({
      teacherId: req.user._id,
      parentId,
      studentId,
      content
    });

    res.status(201).json({ message: "Pesan berhasil dikirim", data: msg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessagesForParent = async (req, res) => {
  try {
    const messages = await Message.find({ parentId: req.user._id })
      .populate('teacherId', 'username')
      .populate('studentId', 'nama');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
