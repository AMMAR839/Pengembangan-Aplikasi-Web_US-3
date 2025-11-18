  // src/server.js
  require('dotenv').config();
  require('./config/passport'); // Inisialisasi passport strategies

  const path = require('path');
  const express = require('express');
  const cors = require('cors');
  const connectDB = require('./config/db');
  const passport = require('passport');

  // Connect Database
  connectDB();

  const app = express();

  // Penting kalau deploy di balik proxy (agar req.protocol = https saat perlu)
  app.set('trust proxy', true);

  // Middleware umum
  app.use(
    cors({
      origin: true,          // nanti bisa diganti process.env.FRONTEND_URL
      credentials: true,
    })
  );

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(passport.initialize());

  // Serve file statis untuk foto kegiatan
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Routes
  // (versi rapi, TANPA "api" di depan, biar URL-nya nanti /api/auth, /api/student, dst)
  app.use('/auth',         require('./routes/auth'));
  app.use('/student',      require('./routes/student'));
  app.use('/teacher',      require('./routes/teacher'));
  app.use('/payment',      require('./routes/payment'));
  app.use('/activities',   require('./routes/activities'));   
  app.use('/attendance',   require('./routes/attendance'));
  app.use('/message',      require('./routes/messages'));
  app.use('/notification', require('./routes/notification'));
  app.use('/weather',      require('./routes/weather'));
  app.use('/feedback',     require('./routes/feedback'));
  app.use('/gallery',      require('./routes/gallery'));
  app.use('/admin',        require('./routes/admin'));

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  });

  // 404 handler
  app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

  // ⬇️ INI PENTING BUAT VERCEL
  module.exports = app;
