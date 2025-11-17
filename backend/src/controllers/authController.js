const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendMail = require('../utils/sendMail');

// register
exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // cek email & username unik
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username sudah ada' });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // token verifikasi random
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

    const backendUrl =
      process.env.BACKEND_URL || 'http://localhost:5000';
    const verifyLink = `${backendUrl}/api/auth/verify-email?token=${token}`;

    // ================= HTML EMAIL DENGAN TOMBOL =================
    const htmlEmail = `
      <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#123047;">
        <h2>Selamat datang di Little Garden!</h2>
        <p>Halo ${user.username},</p>
        <p>Terima kasih sudah mendaftar di <strong>Little Garden Kindergarten</strong>.</p>
        <p>Silakan klik tombol di bawah ini untuk <strong>memverifikasi email</strong> Anda:</p>

        <p style="margin:24px 0;">
          <a href="${verifyLink}"
             style="
               display:inline-block;
               padding:12px 24px;
               border-radius:999px;
               background:#0b6b4d;
               color:#ffffff;
               text-decoration:none;
               font-weight:600;
             ">
            Verifikasi Email Saya
          </a>
        </p>

        <p style="font-size:13px;color:#555;">
          Jika tombol di atas tidak bisa diklik, salin dan tempel link berikut ke browser Anda:
        </p>
        <p style="word-break:break-all;font-size:13px;">
          ${verifyLink}
        </p>

        <p style="font-size:12px;color:#999;margin-top:32px;">
          Email ini dikirim otomatis, mohon tidak membalas email ini.
        </p>
      </div>
    `;

    await sendMail({
      to: email,
      subject: 'Verifikasi Email Little Garden',
      html: htmlEmail,
    });

    return res.json({
      message:
        'Register berhasil. Silakan cek email untuk verifikasi.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: 'User tidak ditemukan' });

    // belum verifikasi email
    if (!user.isVerified) {
      return res.status(400).json({
        message:
          'Email belum diverifikasi. Silakan cek email Anda terlebih dahulu.',
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
    res.status(500).json({ message: err.message });
  }
};

// verifikasi email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const frontend =
      process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!token) {
      return res.redirect(
        `${frontend}/verify-email?status=failed`
      );
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }, // belum expired
    });

    if (!user) {
      return res.redirect(
        `${frontend}/verify-email?status=failed`
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // redirect ke frontend → halaman sukses verifikasi
    return res.redirect(
      `${frontend}/verify-email?status=success`
    );
  } catch (err) {
    console.error(err);
    const frontend =
      process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(
      `${frontend}/verify-email?status=error`
    );
  }
};
