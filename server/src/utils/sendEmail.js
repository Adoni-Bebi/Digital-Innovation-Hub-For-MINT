const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.log('Email skipped: SMTP_HOST / SMTP_USER / SMTP_PASS not set');
      return { ok: false, reason: 'missing_env' };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"Digital Innovation Hub" <${process.env.EMAIL_USER || user}>`,
      to,
      subject,
      html,
    });

    console.log(`Email OK → to=${to} subject="${subject}" id=${info.messageId}`);
    return { ok: true, id: info.messageId };
  } catch (error) {
    console.error('Email FAILED →', error.message);
    return { ok: false, reason: error.message };
  }
};

module.exports = sendEmail;