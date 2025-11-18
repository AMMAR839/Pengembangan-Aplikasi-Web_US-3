const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username sudah ada' });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash, role: 'user' });

    res.json({ message: 'Akun dibuat, silakan login' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: 'User tidak ditemukan' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: 'Password salah' });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    // Logout di backend bersifat stateless (token masih valid sampai expired)
    // Frontend akan handle dengan delete token dari localStorage
    res.json({ message: 'Logout berhasil' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User tidak ditemukan' });
    }

    // Generate reset token (valid 1 jam)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = Date.now() + 3600000; // 1 jam

    user.resetToken = resetTokenHash;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Kirim email dengan link reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: username,
      subject: 'Reset Password - PAUD App',
      html: `
        <h2>Permintaan Reset Password</h2>
        <p>Klik link di bawah untuk reset password Anda (berlaku 1 jam):</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Jika Anda tidak meminta ini, abaikan email ini.</p>
      `,
    });

    res.json({ message: 'Link reset password telah dikirim ke email Anda' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id, token, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: 'User tidak ditemukan' });
    }

    // Check token validity
    if (!user.resetToken || Date.now() > user.resetTokenExpiry) {
      return res.status(400).json({ message: 'Token reset password expired' });
    }

    const tokenMatch = await bcrypt.compare(token, user.resetToken);
    if (!tokenMatch) {
      return res.status(400).json({ message: 'Token reset password tidak valid' });
    }

    // Update password
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password berhasil direset' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetToken -resetTokenExpiry');
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
