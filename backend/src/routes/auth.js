const express = require('express');
const router = express.Router();

const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const { register, login, logout, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Register & login biasa
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth, getMe);

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

// Callback dari Google (dipanggil oleh Google, bukan frontend)
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
      (email ? await User.findOne({ username: email }) : null);

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
          username: email || googleId,
          password: randomPass,
          googleId,
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
