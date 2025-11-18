// src/routes/auth.js
const express = require('express');
const router = express.Router();

const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/User');

const {
  register,
  login,
  verifyEmail,
  me,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');

const { auth } = require('../middleware/auth');  // ⬅️ PERHATIKAN: ../middleware/auth

// ===== REGISTER & LOGIN BIASA =====
router.post('/register', register);
router.post('/login', login);
router.post('/logout', auth, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// PROFIL USER LOGIN
router.get('/me', auth, getMe);

// GANTI PASSWORD USER LOGIN
router.post('/change-password', auth, changePassword);

// ===== GOOGLE AUTH (login & register) =====

// Login pakai Google (user yang SUDAH terdaftar)
router.get(
  '/google/login',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: 'login',
  })
);

// Register pakai Google (buat akun baru)
router.get(
  '/google/register',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: 'register',
  })
);

// Verifikasi email (link dari Gmail)
router.get('/verify-email', verifyEmail);

// Callback dari Google
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const profile = req.user;
    const mode = req.query.state || 'login'; // 'login' atau 'register'
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

    let user =
      (await User.findOne({ googleId })) ||
      (email ? await User.findOne({ email }) : null);

    try {
      if (mode === 'login') {
        // LOGIN: kalau belum terdaftar, jangan auto register
        if (!user) {
          return res.redirect(
            `${frontend}/auth/google/callback?error=not_registered`
          );
        }
      } else if (mode === 'register') {
        // REGISTER: kalau sudah ada, jangan buat lagi
        if (user) {
          return res.redirect(
            `${frontend}/auth/google/callback?error=already_registered`
          );
        }

        const randomPass = await bcrypt.hash(
          Math.random().toString(36).slice(-8),
          10
        );

        user = await User.create({
          email: email || undefined,
          username: email || googleId,
          password: randomPass,
          googleId,
          isVerified: true, // login via Google → kita anggap verified
        });
      }

      // Sampai sini user pasti ada
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      const redirectUrl = `${frontend}/auth/google/callback?token=${token}&username=${encodeURIComponent(
        user.username
      )}&role=${user.role}&mode=${mode}`;

      return res.redirect(redirectUrl);
    } catch (err) {
      console.error(err);
      return res.redirect(
        `${frontend}/auth/google/callback?error=server_error`
      );
    }
  }
);

module.exports = router;

// ===== GOOGLE AUTH (login & register) =====

// Login pakai Google (user yang SUDAH terdaftar)
router.get(
  '/google/login',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: 'login',
  })
);

// Register pakai Google (buat akun baru)
router.get(
  '/google/register',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: 'register',
  })
);

// Verifikasi email (link dari Gmail)
router.get('/verify-email', verifyEmail);

// Callback dari Google
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const profile = req.user;
    const mode = req.query.state || 'login'; // 'login' atau 'register'
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

    let user =
      (await User.findOne({ googleId })) ||
      (email ? await User.findOne({ email }) : null);

    try {
      if (mode === 'login') {
        // LOGIN: kalau belum terdaftar, jangan auto register
        if (!user) {
          return res.redirect(
            `${frontend}/auth/google/callback?error=not_registered`
          );
        }
      } else if (mode === 'register') {
        // REGISTER: kalau sudah ada, jangan buat lagi
        if (user) {
          return res.redirect(
            `${frontend}/auth/google/callback?error=already_registered`
          );
        }

        const randomPass = await bcrypt.hash(
          Math.random().toString(36).slice(-8),
          10
        );

        user = await User.create({
          email: email || undefined,
          username: email || googleId,
          password: randomPass,
          googleId,
          isVerified: true, // login via Google → kita anggap verified
        });
      }

      // Sampai sini user pasti ada
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      const redirectUrl = `${frontend}/auth/google/callback?token=${token}&username=${encodeURIComponent(
        user.username
      )}&role=${user.role}&mode=${mode}`;

      return res.redirect(redirectUrl);
    } catch (err) {
      console.error(err);
      return res.redirect(
        `${frontend}/auth/google/callback?error=server_error`
      );
    }
  }
);

module.exports = router;
