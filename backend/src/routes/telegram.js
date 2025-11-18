const express = require('express');
const router = express.Router();
const User = require('../models/User');
const telegramService = require('../services/telegramService');
const { auth, requireRole } = require('../middleware/auth');

/**
 * POST /api/telegram/connect
 * Connect user's Telegram account
 */
router.post('/connect', auth, async (req, res) => {
  try {
    const { telegramChatId, telegramUsername } = req.body;

    // If only username provided, try to find chat ID from recent bot messages
    if (!telegramChatId && telegramUsername) {
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const axios = require('axios');
        
        // Get recent updates to find user by username
        const response = await axios.get(
          `https://api.telegram.org/bot${botToken}/getUpdates`,
          { params: { limit: 100 } }
        );

        const updates = response.data.result || [];
        let foundChatId = null;
        
        // Clean username (remove @ if present)
        const cleanUsername = telegramUsername.replace('@', '').toLowerCase();

        // Search for matching username in recent messages
        for (const update of updates.reverse()) {
          if (update.message && update.message.from) {
            const msgUsername = (update.message.from.username || '').toLowerCase();
            if (msgUsername === cleanUsername) {
              foundChatId = update.message.chat.id.toString();
              break;
            }
          }
        }

        if (!foundChatId) {
          return res.status(404).json({
            success: false,
            message: 'Username tidak ditemukan. Pastikan Anda sudah mengirim pesan ke bot terlebih dahulu.'
          });
        }

        // Update user with found chat ID
        const user = await User.findByIdAndUpdate(
          req.user.id,
          {
            telegramChatId: foundChatId,
            telegramUsername: `@${cleanUsername}`
          },
          { new: true }
        );

        // Send welcome message
        const telegramService = require('../services/telegramService');
        const welcomeMessage = `✅ <b>Akun Terhubung!</b>\n\nHalo ${user.fullName || user.username}!\n\nTelegram Anda berhasil terhubung dengan Little Garden Islamic School.\n\nAnda akan menerima notifikasi tentang:\n• Kehadiran anak\n• Kegiatan sekolah\n• Pembayaran\n• Pengumuman penting\n\n<i>Little Garden Islamic School</i>`;
        
        await telegramService.sendMessage(foundChatId, welcomeMessage);

        return res.json({
          success: true,
          message: 'Telegram account connected successfully via username',
          data: {
            telegramChatId: foundChatId,
            telegramUsername: `@${cleanUsername}`
          }
        });
      } catch (error) {
        console.error('Error finding username:', error);
        return res.status(500).json({
          success: false,
          message: 'Gagal mencari username. Pastikan Anda sudah mengirim pesan ke bot.'
        });
      }
    }

    if (!telegramChatId) {
      return res.status(400).json({
        success: false,
        message: 'Telegram Chat ID atau Username is required'
      });
    }

    // Update user with Telegram info
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        telegramChatId,
        telegramUsername: telegramUsername || null
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send welcome message
    const welcomeMessage = `✅ <b>Akun Terhubung!</b>\n\nHalo ${user.fullName || user.username}!\n\nTelegram Anda berhasil terhubung dengan Little Garden Islamic School.\n\nAnda akan menerima notifikasi tentang:\n• Kehadiran anak\n• Kegiatan sekolah\n• Pembayaran\n• Pengumuman penting\n\n<i>Little Garden Islamic School</i>`;
    
    await telegramService.sendMessage(telegramChatId, welcomeMessage);

    res.json({
      success: true,
      message: 'Telegram account connected successfully',
      data: {
        telegramChatId: user.telegramChatId,
        telegramUsername: user.telegramUsername
      }
    });
  } catch (error) {
    console.error('Error connecting Telegram:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect Telegram account',
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/disconnect
 * Disconnect user's Telegram account
 */
router.post('/disconnect', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        telegramChatId: null,
        telegramUsername: null
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Telegram account disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting Telegram:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Telegram account',
      error: error.message
    });
  }
});

/**
 * GET /api/telegram/status
 * Check if user has connected Telegram
 */
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('telegramChatId telegramUsername');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      connected: !!user.telegramChatId,
      data: {
        telegramChatId: user.telegramChatId,
        telegramUsername: user.telegramUsername
      }
    });
  } catch (error) {
    console.error('Error checking Telegram status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check Telegram status',
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/webhook
 * Webhook endpoint for Telegram bot updates
 * This is where Telegram sends updates (messages, commands, etc.)
 */
router.post('/webhook', async (req, res) => {
  try {
    const update = req.body;

    // Handle /start command with deep link parameter
    if (update.message && update.message.text) {
      const text = update.message.text;
      const chatId = update.message.chat.id;
      const username = update.message.from.username;

      // Check for /start command with userId parameter
      if (text.startsWith('/start ')) {
        const userId = text.split(' ')[1];

        // Find user and update Telegram info
        const user = await User.findById(userId);

        if (user) {
          user.telegramChatId = chatId.toString();
          user.telegramUsername = username ? `@${username}` : null;
          await user.save();

          const welcomeMessage = `✅ <b>Akun Terhubung!</b>\n\nHalo ${user.fullName || user.username}!\n\nTelegram Anda berhasil terhubung dengan Little Garden Islamic School.\n\nAnda akan menerima notifikasi tentang:\n• Kehadiran anak\n• Kegiatan sekolah\n• Pembayaran\n• Pengumuman penting\n\n<i>Little Garden Islamic School</i>`;
          
          await telegramService.sendMessage(chatId, welcomeMessage);
        } else {
          await telegramService.sendMessage(
            chatId,
            '❌ User tidak ditemukan. Silakan hubungi administrator.'
          );
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
});

/**
 * POST /api/telegram/test
 * Send test notification (admin only)
 */
router.post('/test', auth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.telegramChatId) {
      return res.status(400).json({
        success: false,
        message: 'Your Telegram account is not connected'
      });
    }

    const testMessage = `🧪 <b>Test Notification</b>\n\nThis is a test notification from Little Garden Islamic School.\n\nYour Telegram is connected successfully! ✅\n\n<i>Sent at ${new Date().toLocaleString('id-ID')}</i>`;

    const result = await telegramService.sendMessage(user.telegramChatId, testMessage);

    if (result.success) {
      res.json({
        success: true,
        message: 'Test notification sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

module.exports = router;
