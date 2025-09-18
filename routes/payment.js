const express = require('express');
const { callback } = require('../controllers/paymentController');
const router = express.Router();

router.post('/callback', callback);

module.exports = router;
