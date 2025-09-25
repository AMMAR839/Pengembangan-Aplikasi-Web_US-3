const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markAsRead } = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

router.post('/send', auth, sendMessage);
router.get('/', auth, getMessages);
router.put('/:messageId/read', auth, markAsRead);

module.exports = router;
