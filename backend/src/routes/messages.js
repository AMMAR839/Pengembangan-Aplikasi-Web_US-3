const express = require('express');
const { auth } = require('../middleware/auth');
const { sendMessage, getMessagesForParent } = require('../controllers/messageController');
const router = express.Router();

router.post('/send', auth, sendMessage);

router.get('/inbox', auth, getMessagesForParent);

module.exports = router;
