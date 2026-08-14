const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.log('Email skipped: EMAIL_USER or EMAIL_PASS not set on server');
      return { ok: false, reason: 'missing_env' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Digital Innovation Hub" <${user}>`,
      to,
      subject,
      html,
    });

    console.log(`Email OK → to=${to} subject="${subject}" id=${info.messageId}`);
    return { ok: true, id: info.messageId };
  } catch (error) {
    console.error('Email FAILED →', error.message);
    if (error.response) console.error('Email response:', error.response);
    return { ok: false, reason: error.message };
  }
};

module.exports = sendEmail;