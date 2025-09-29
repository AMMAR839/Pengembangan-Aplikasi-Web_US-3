const Payment = require('../models/Payment');
const Student = require('../models/Student');
const User = require('../models/User');

exports.callback = async (req,res)=>{
  try {
    const { order_id, transaction_status } = req.body;

    const payment = await Payment.findOne({ orderId: order_id });
    if (!payment) return res.status(404).json({ message: 'Pembayaran tidak ditemukan' });

    if (transaction_status === 'settlement') {
      payment.status = 'settlement';
      await payment.save();

      await Student.findByIdAndUpdate(payment.studentId, { status: 'active' });
    }

     await User.updateOne(
      { _id: payment.userId, role: 'user' },
      { $set: { role: 'parent' } }
      );


    res.status(200).send('OK');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
