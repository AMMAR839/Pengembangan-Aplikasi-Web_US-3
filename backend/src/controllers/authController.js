const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req,res)=>{
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message:'Username sudah ada' });

    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash, role: 'user' });
    res.json({ message: 'Akun dibuat, silakan login' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req,res)=>{
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message:'User tidak ditemukan' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message:'Password salah' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn:'1d' });
    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
