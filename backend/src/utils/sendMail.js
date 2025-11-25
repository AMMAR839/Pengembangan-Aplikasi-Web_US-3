const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // kita pakai Gmail
  auth: {
    user: process.env.MAIL_USER, // email pengirim
    pass: process.env.MAIL_PASS, // APP PASSWORD (bukan password biasa!)
  },
});

async function sendMail({ to, subject, html }) {
  try {
    console.log('=== SENDMAIL MULAI ===');
    console.log('KE:', to);

    const info = await transporter.sendMail({
      from: `"Little Garden" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('EMAIL TERKIRIM:', info.messageId);
  } catch (err) {
    console.error('=== SENDMAIL ERROR ===');
    console.error('NAME   :', err.name);
    console.error('MESSAGE:', err.message);
    console.error('CODE   :', err.code);
    console.error('ERRNO  :', err.errno);
    console.error('ADDRESS:', err.address);
    console.error('PORT   :', err.port);
    throw err;
  }
}


module.exports = sendMail;
