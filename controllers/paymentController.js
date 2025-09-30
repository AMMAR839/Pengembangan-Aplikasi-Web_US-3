const crypto = require('crypto');
const midtransClient = require('midtrans-client');

const Payment = require('../models/Payment');
const Student = require('../models/Student');
const User = require('../models/User');

const AMOUNT = Number(process.env.REGISTRATION_FEE || 25000);
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

function createSnap() {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PROD === 'true',
    serverKey: MIDTRANS_SERVER_KEY
  });
}

// Buat/ulang payment pending utk 1 siswa (doc Student)
async function createOrReusePayment({ student, user }) {
  let payment = await Payment.findOne({ studentNik: student.nik, status: 'pending' });
  if (payment?.redirectUrl) {
    return { order_id: payment.orderId, payment_url: payment.redirectUrl, reused: true };
  }

  const snap = createSnap();
  const orderId = `PAUD-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const parameter = {
    transaction_details: { order_id: orderId, gross_amount: AMOUNT }, 
    // enabled_payments: ['qris'],
    // enabled_payments: ['qris','gopay','shopeepay','bank_transfer','bca_va','bni_va','bri_va','echannel','permata_va','other_va','credit_card'],
    item_details: [{ id: 'pendaftaran', price: AMOUNT, quantity: 1, name: `Pendaftaran ${student.nama}` }],
    customer_details: { first_name: user.username }
  };

  const tx = await snap.createTransaction(parameter);

  if (!payment) {
    await Payment.create({
      userId: user._id,
      studentNik: student.nik,
      orderId,
      amount: AMOUNT,
      status: 'pending',
      redirectUrl: tx.redirect_url
    });
  } else {
    payment.orderId = orderId;
    payment.redirectUrl = tx.redirect_url;
    await payment.save();
  }

  return { order_id: orderId, payment_url: tx.redirect_url, reused: false };
}

// === SINGLE: input 1 NIK → dapat link bayar
exports.checkoutByNik = async (req, res) => {
  try {
    const { nik } = req.body;
    if (!nik) return res.status(400).json({ message: 'NIK wajib diisi' });

    const isAdmin = req.user.role === 'admin';
    const student = await Student.findOne(
      isAdmin ? { nik } : { nik, parentUserId: req.user._id }
    );
    if (!student) return res.status(404).json({ message: 'Siswa tidak ditemukan / bukan milik Anda' });

    if (student.status === 'active') {
      return res.json({ message: 'Siswa sudah aktif. Tidak perlu membayar.' });
    }

    const result = await createOrReusePayment({ student, user: req.user });
    res.json({
      message: result.reused ? 'Lanjutkan pembayaran yang tertunda' : 'Silakan lanjutkan pembayaran',
      ...result
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// (opsional) verifikasi signature Midtrans
function verifyMidtransSignature(body) {
  try {
    const { signature_key, order_id, status_code, gross_amount } = body || {};
    if (!signature_key || !order_id || !status_code || !gross_amount || !MIDTRANS_SERVER_KEY) return false;
    const payload = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`;
    const calc = crypto.createHash('sha512').update(payload).digest('hex');
    return calc === signature_key;
  } catch {
    return false;
  }
}

// === CALLBACK Midtrans
exports.callback = async (req, res) => {
  try {
    if (process.env.MIDTRANS_VERIFY_SIG === 'true') {
      if (!verifyMidtransSignature(req.body)) return res.status(403).send('Invalid signature');
    }

    const { order_id, transaction_status, gross_amount } = req.body;
    const payment = await Payment.findOne({ orderId: order_id });
    if (!payment) return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });

    if (gross_amount && Number(gross_amount) !== Number(payment.amount)) {
      // optional strict check: return res.status(400).send('Amount mismatch');
    }

    const mapStatus = (s) => {
      if (['settlement','pending','expire','cancel','deny','failed'].includes(s)) return s;
      return payment.status;
    };
    const newStatus = mapStatus(transaction_status);

    if (newStatus !== payment.status) {
      payment.status = newStatus;
      await payment.save();

      if (newStatus === 'settlement') {
        await Student.findOneAndUpdate({ nik: payment.studentNik }, { status: 'active' });
        await User.updateOne({ _id: payment.userId, role: 'user' }, { $set: { role: 'parent' } });
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
