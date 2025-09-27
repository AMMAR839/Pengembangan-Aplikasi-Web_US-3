const Student = require('../models/Student');
const Payment = require('../models/Payment');
const midtransClient = require('midtrans-client');

exports.registerStudent = async (req,res)=>{
  try {
    const { nama, tanggalLahir, alamat } = req.body;

    const student = await Student.create({
      nama,
      tanggalLahir,
      alamat,
      parentUserId: req.user._id
    });

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY
    });

    const orderId = 'PAUD-' + Date.now();
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 25000
      },
      payment_type: 'qris'
    };

    await Payment.create({
      userId: req.user._id,
      studentId: student._id,
      orderId,
      amount: 25000,
      status: 'pending'
    });

    const transaction = await snap.createTransaction(parameter);

    res.json({
      message: 'Pendaftaran anak berhasil, lanjutkan pembayaran',
      student,
      payment_url: transaction.redirect_url
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
