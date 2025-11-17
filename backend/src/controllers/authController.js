// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendMail = require('../utils/sendMail');

// REGISTER + kirim email verifikasi
exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: 'Email, username, dan password wajib diisi' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username sudah ada' });
    }

    const hash = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      email,
      username,
      password: hash,
      role: 'user',
      isVerified: false,
      verificationToken: token,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
    });

    const verifyLink = `${
      process.env.BACKEND_URL || 'http://localhost:5000'
    }/api/auth/verify-email?token=${token}`;

    await sendMail({
      to: email,
      subject: 'Verifikasi Email Little Garden',
      html: `
        <p>Halo ${username || ''},</p>
        <p>Terima kasih sudah mendaftar di Little Garden.</p>
        <p>Silakan klik tombol berikut untuk memverifikasi email Anda:</p>
        <p>
          <a href="${verifyLink}"
             style="padding:10px 18px;background:#0b6b4d;color:#fff;border-radius:999px;text-decoration:none;">
            Verifikasi Email
          </a>
        </p>
        <p>Jika tombol tidak bisa diklik, salin link ini ke browser Anda:</p>
        <p>${verifyLink}</p>
      `,
    });

    res.json({
      message: 'Register berhasil. Silakan cek email untuk verifikasi.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// LOGIN (hanya yang sudah verifikasi)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: 'User tidak ditemukan' });

    if (!user.isVerified) {
      return res.status(400).json({
        message: 'Email belum diverifikasi. Silakan cek email Anda.',
      });
    }

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
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// VERIFIKASI EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(`${frontend}/verify-email?status=failed`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.redirect(`${frontend}/verify-email?status=success`);
  } catch (err) {
    console.error(err);
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontend}/verify-email?status=error`);
  }
};

// PROFIL USER LOGIN: GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const user = req.user; // diisi middleware auth
    if (!user) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    res.json({
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GANTI PASSWORD: POST /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Password lama dan password baru wajib diisi' });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password baru minimal 6 karakter' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Password lama salah' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    return res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
