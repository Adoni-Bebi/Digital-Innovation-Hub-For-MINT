const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email skipped (EMAIL_USER / EMAIL_PASS not set)');
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Digital Innovation Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Email error:', error.message);
    // Don't crash the request if email fails
  }
};

module.exports = sendEmail;