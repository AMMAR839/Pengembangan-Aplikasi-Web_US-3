const express = require('express');
const router = express.Router();

const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const { register, login, verifyEmail } = require('../controllers/authController');

// Register & login biasa
router.post('/register', register);
router.post('/login', login);

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

router.get('/verify-email', verifyEmail);

// Callback dari Google (dipanggil oleh Google, bukan frontend)
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const profile = req.user;
    const mode = req.query.state || 'login';
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      let user =
        (await User.findOne({ googleId })) ||
        (email ? await User.findOne({ email }) : null);

      if (mode === 'login') {
        // kalau login tapi belum pernah daftar sama sekali
        if (!user) {
          return res.redirect(
            `${frontend}/auth/google/callback?error=not_registered`
          );
        }

        // kalau user ditemukan lewat email, tapi belum punya googleId → link akun
        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
        }
      } else if (mode === 'register') {
        // register pakai Google → jangan buat kalau sudah ada (baik email atau googleId)
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
          email: email || `${googleId}@dummy.local`,
          username: email || googleId,
          password: randomPass,
          googleId,
          isVerified: true, // kalau mau Google dianggap otomatis verified
        });
      }

      // sampai sini user pasti ada
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
