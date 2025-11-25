// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendMail = require('../utils/sendMail');

// REGISTER + kirim email verifikasi
exports.register = async (req, res) => {
  try {
    console.log('=== REGISTER DIPANGGIL ===');

    const { email, username, password } = req.body;
    console.log('DATA MASUK:', { email, username });

    if (!email || !username || !password) {
      console.log('VALIDASI GAGAL: ada field kosong');
      return res
        .status(400)
        .json({ message: 'Email, username, dan password wajib diisi' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log('EMAIL SUDAH DIGUNAKAN:', email);
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log('USERNAME SUDAH ADA:', username);
      return res.status(400).json({ message: 'Username sudah ada' });
    }

    const hash = await bcrypt.hash(password, 10);
    console.log('PASSWORD TERENKRIPSI');

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

    console.log('USER TERSIMPAN DI DB, ID:', user._id.toString());

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const verifyLink = `${backendUrl}/api/auth/verify-email?token=${token}`;

    console.log('KIRIM EMAIL KE:', email);
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
    console.log('SELESAI KIRIM EMAIL');

    res.json({
      message: 'Register berhasil. Silakan cek email untuk verifikasi.',
    });
    console.log('RESPON REGISTER DIKIRIM KE CLIENT');
  } catch (err) {
    console.error('=== REGISTER ERROR ===');
    console.error(err);          // 🔴 error detail di sini
    res.status(500).json({ message: err.message });
  }
};

// LOGIN (boleh pakai username ATAU email, dan hanya yang sudah verifikasi)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // di frontend field-nya namanya "username", tapi isinya boleh username atau email
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username / email dan password wajib diisi' });
    }

    const identifier = username; // bisa username, bisa email

    // cari user berdasarkan username ATAU email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: 'User tidak ditemukan' });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: 'Email belum diverifikasi. Silakan cek email Anda.',
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, username: user.username, role: user.role });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Terjadi kesalahan di server (login)' });
  }
};

// VERIFIKASI EMAIL
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const frontend = process.env.FRONTEND_URL ;

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
    const frontend = process.env.FRONTEND_URL ;
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

    await sendMail({
      to: user.email,
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
