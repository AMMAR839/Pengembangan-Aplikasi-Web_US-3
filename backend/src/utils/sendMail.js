const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // kita pakai Gmail
  auth: {
    user: process.env.MAIL_USER, // email pengirim
    pass: process.env.MAIL_PASS, // APP PASSWORD (bukan password biasa!)
  },
});

async function sendMail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: `"Little Garden" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log('Email verifikasi terkirim:', info.messageId);
}

module.exports = sendMail;
