  // src/server.js
  require('dotenv').config();
  require('./config/passport'); // Inisialisasi passport strategies

const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const http = require('http');
const { Server } = require('socket.io');

  // Connect Database
  connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  }

  // Penting kalau deploy di balik proxy (agar req.protocol = https saat perlu)
  app.set('trust proxy', true);

  // Middleware umum
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

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// For local development - start server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  
    // Auto-start Telegram polling for localhost development
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
      const axios = require('axios');
      
      let lastUpdateId = 0;
      
      const pollTelegram = async () => {
        try {
          const response = await axios.get(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates`,
            {
              params: { offset: lastUpdateId + 1, timeout: 5 }
            }
          );

          const updates = response.data.result || [];
          const User = require('./models/User');
          const telegramService = require('./services/telegramService');

          for (const update of updates) {
            if (update.update_id > lastUpdateId) {
              lastUpdateId = update.update_id;
            }

            if (update.message && update.message.text) {
              const text = update.message.text;
              const chatId = update.message.chat.id;
              const username = update.message.from.username;

              if (text.startsWith('/start ')) {
                const userId = text.split(' ')[1];
                const user = await User.findById(userId);

                if (user) {
                  user.telegramChatId = chatId.toString();
                  user.telegramUsername = username ? `@${username}` : null;
                  await user.save();

                  const welcomeMessage = `✅ <b>Akun Terhubung!</b>\n\nHalo ${user.fullName || user.username}!\n\nTelegram Anda berhasil terhubung dengan Little Garden Pre-school.\n\nAnda akan menerima notifikasi tentang:\n• Kehadiran anak\n• Kegiatan sekolah\n• Pembayaran\n• Pengumuman penting\n\n<i>Little Garden Pre-school</i>`;
                  
                  await telegramService.sendMessage(chatId, welcomeMessage);
                  console.log(`✅ [AUTO-POLLING] Telegram connected: ${user.username} (${chatId})`);
                }
              }
            }
          }
        } catch (error) {
          // Silent fail for polling errors
        }
      };

      // Poll every 3 seconds
      setInterval(pollTelegram, 3000);
      console.log('✅ Telegram auto-polling started (every 3 seconds)');
    }
  });
}

// ⬇️ INI PENTING BUAT VERCEL
module.exports = app;
