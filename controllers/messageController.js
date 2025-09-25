const Message = require('../models/Message');
const Student = require('../models/Student');

// Guru mengirim pesan ke orang tua
exports.sendMessage = async (req, res) => {
  try {
    const { studentId, message, type } = req.body;
    
    // Cek apakah siswa ada
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }

    const newMessage = new Message({
      studentId,
      teacherId: req.user._id,
      message,
      type: type || 'umum'
    });

    await newMessage.save();
    res.status(201).json({ message: 'Pesan berhasil dikirim', data: newMessage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Orang tua melihat pesan untuk anaknya
exports.getMessages = async (req, res) => {
  try {
    // Dapatkan semua siswa yang dimiliki orang tua ini
    const students = await Student.find({ parentUserId: req.user._id });
    const studentIds = students.map(student => student._id);

    const messages = await Message.find({ studentId: { $in: studentIds } })
      .populate('teacherId', 'username')
      .populate('studentId', 'nama')
      .sort({ date: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tandai pesan sebagai sudah dibaca
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    await Message.findByIdAndUpdate(messageId, { isRead: true });
    res.json({ message: 'Pesan ditandai sebagai sudah dibaca' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
