const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const telegramService = require('../services/telegramService');

// Store last update ID to avoid processing duplicates
let lastUpdateId = 0;

/**
 * GET /api/telegram/poll
 * Poll for new Telegram updates (alternative to webhook for localhost)
 */
router.get('/poll', async (req, res) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken || botToken === 'YOUR_BOT_TOKEN_HERE') {
      return res.status(400).json({
        success: false,
        message: 'Bot token not configured'
      });
    }

    // Get updates from Telegram
    const response = await axios.get(
      `https://api.telegram.org/bot${botToken}/getUpdates`,
      {
        params: {
          offset: lastUpdateId + 1,
          timeout: 10
        }
      }
    );

    const updates = response.data.result || [];
    const processed = [];

    for (const update of updates) {
      // Update lastUpdateId
      if (update.update_id > lastUpdateId) {
        lastUpdateId = update.update_id;
      }

      // Process /start command
      if (update.message && update.message.text) {
        const text = update.message.text;
        const chatId = update.message.chat.id;
        const username = update.message.from.username;

        if (text.startsWith('/start ')) {
          const userId = text.split(' ')[1];

          // Find user and update Telegram info
          const user = await User.findById(userId);

          if (user) {
            user.telegramChatId = chatId.toString();
            user.telegramUsername = username ? `@${username}` : null;
            await user.save();

            const welcomeMessage = `✅ <b>Akun Terhubung!</b>\n\nHalo ${user.fullName || user.username}!\n\nTelegram Anda berhasil terhubung dengan Little Garden Pre-school.\n\nAnda akan menerima notifikasi tentang:\n• Kehadiran anak\n• Kegiatan sekolah\n• Pembayaran\n• Pengumuman penting\n\n<i>Little Garden Pre-school</i>`;
            
            await telegramService.sendMessage(chatId, welcomeMessage);

            processed.push({
              userId: user._id,
              username: user.username,
              chatId: chatId.toString()
            });

            console.log(`✅ Telegram connected for user: ${user.username} (Chat ID: ${chatId})`);
          } else {
            await telegramService.sendMessage(
              chatId,
              '❌ User tidak ditemukan. Silakan hubungi administrator.'
            );
          }
        }
      }
    }

    res.json({
      success: true,
      processed: processed.length,
      updates: processed,
      lastUpdateId
    });
  } catch (error) {
    console.error('Error polling Telegram:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to poll Telegram updates',
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/start-polling
 * Start continuous polling (for development)
 */
router.post('/start-polling', (req, res) => {
  if (global.telegramPolling) {
    return res.json({
      success: true,
      message: 'Polling already running'
    });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken || botToken === 'YOUR_BOT_TOKEN_HERE') {
    return res.status(400).json({
      success: false,
      message: 'Bot token not configured'
    });
  }

  // Poll every 5 seconds
  global.telegramPolling = setInterval(async () => {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${botToken}/getUpdates`,
        {
          params: {
            offset: lastUpdateId + 1,
            timeout: 5
          }
        }
      );

      const updates = response.data.result || [];

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
              console.log(`✅ [POLLING] Telegram connected: ${user.username} (${chatId})`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Polling error:', error.message);
    }
  }, 5000);

  console.log('✅ Telegram polling started (every 5 seconds)');
  
  res.json({
    success: true,
    message: 'Telegram polling started'
  });
});

/**
 * POST /api/telegram/stop-polling
 * Stop continuous polling
 */
router.post('/stop-polling', (req, res) => {
  if (global.telegramPolling) {
    clearInterval(global.telegramPolling);
    global.telegramPolling = null;
    console.log('⏹️ Telegram polling stopped');
    
    res.json({
      success: true,
      message: 'Telegram polling stopped'
    });
  } else {
    res.json({
      success: true,
      message: 'Polling was not running'
    });
  }
});

module.exports = router;
