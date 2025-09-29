const Student = require('../models/Student');
const Payment = require('../models/Payment');
const midtransClient = require('midtrans-client');

exports.registerStudent = async (req,res)=>{
  try {
    const {nik, nama, tanggalLahir, alamat,
  golonganDarah, jenisKelamin, agama,
  NamaOrangtua, NoHPOrangtua } = req.body;

    const student = await Student.create({
      nik,
      nama,
      tanggalLahir,
      alamat,
      golonganDarah,
      jenisKelamin,
      agama,
      NamaOrangtua,
      NoHPOrangtua,
      parentUserId: req.user._id
    });

    const existingStudent = await Student.exists({ nik });
    if (existingStudent) {
      return res.status(400).json({ message: 'NIK sudah terdaftar' });
    }

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
      studentNIK: student.nik,
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
