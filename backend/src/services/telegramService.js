const axios = require('axios');

class TelegramService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Send a message to a specific Telegram chat
   * @param {string} chatId - Telegram chat ID
   * @param {string} message - Message text
   * @param {object} options - Additional options (parse_mode, etc.)
   */
  async sendMessage(chatId, message, options = {}) {
    try {
      if (!this.botToken || this.botToken === 'YOUR_BOT_TOKEN_HERE') {
        console.warn('⚠️ Telegram bot token not configured');
        return { success: false, error: 'Bot token not configured' };
      }

      const response = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: options.parse_mode || 'HTML',
        ...options
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error sending Telegram message:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.description || error.message };
    }
  }

  /**
   * Send a photo to a specific Telegram chat
   * @param {string} chatId - Telegram chat ID
   * @param {string} photoUrl - Photo URL or file_id
   * @param {string} caption - Photo caption
   */
  async sendPhoto(chatId, photoUrl, caption = '') {
    try {
      if (!this.botToken || this.botToken === 'YOUR_BOT_TOKEN_HERE') {
        console.warn('⚠️ Telegram bot token not configured');
        return { success: false, error: 'Bot token not configured' };
      }

      const response = await axios.post(`${this.baseUrl}/sendPhoto`, {
        chat_id: chatId,
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML'
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error sending Telegram photo:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.description || error.message };
    }
  }

  /**
   * Send bulk notifications to multiple users
   * @param {Array} users - Array of user objects with telegramChatId
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   */
  async sendBulkNotification(users, title, body) {
    if (!this.botToken || this.botToken === 'YOUR_BOT_TOKEN_HERE') {
      console.warn('⚠️ Telegram bot token not configured, skipping notifications');
      return { sent: 0, failed: 0, errors: ['Bot token not configured'] };
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    for (const user of users) {
      if (!user.telegramChatId) {
        continue;
      }

      const message = this.formatNotification(title, body);
      const result = await this.sendMessage(user.telegramChatId, message);

      if (result.success) {
        results.sent++;
        console.log(`✅ Telegram sent to ${user.telegramUsername || user.telegramChatId}`);
      } else {
        results.failed++;
        results.errors.push({
          chatId: user.telegramChatId,
          error: result.error
        });
        console.error(`❌ Failed to send to ${user.telegramChatId}: ${result.error}`);
      }

      // Rate limiting: Telegram allows 30 messages/second, we use 20/second to be safe
      await this.delay(50);
    }

    return results;
  }

  /**
   * Format notification message for Telegram
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   */
  formatNotification(title, body) {
    return `<b>🔔 ${title}</b>\n\n${body}\n\n<i>Little Garden Pre-school</i>`;
  }

  /**
   * Set webhook URL for receiving updates
   * @param {string} webhookUrl - Your webhook URL
   */
  async setWebhook(webhookUrl) {
    try {
      const response = await axios.post(`${this.baseUrl}/setWebhook`, {
        url: webhookUrl
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error setting webhook:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.description || error.message };
    }
  }

  /**
   * Get webhook info
   */
  async getWebhookInfo() {
    try {
      const response = await axios.get(`${this.baseUrl}/getWebhookInfo`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error getting webhook info:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.description || error.message };
    }
  }

  /**
   * Delete webhook (use polling instead)
   */
  async deleteWebhook() {
    try {
      const response = await axios.post(`${this.baseUrl}/deleteWebhook`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Error deleting webhook:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.description || error.message };
    }
  }

  /**
   * Utility function to delay execution
   * @param {number} ms - Milliseconds to delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new TelegramService();
