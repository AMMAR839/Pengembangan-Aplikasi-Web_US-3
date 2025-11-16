const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { checkoutByNik, callback } = require('../controllers/paymentController');

// Ortu/Admin: bayar untuk 1 anak pakai NIK
router.post('/checkout-by-nik', auth, checkoutByNik);

// Midtrans callback (server-to-server)
router.post('/callback', callback);

module.exports = router;
