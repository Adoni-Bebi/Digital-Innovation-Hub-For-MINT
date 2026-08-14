const { Resend } = require('resend');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.log('Email skipped (RESEND_API_KEY not set)');
      return;
    }

    const resend = new Resend(apiKey);

    const from =
      process.env.EMAIL_FROM || 'Digital Innovation Hub <onboarding@resend.dev>';

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Email error:', error.message || JSON.stringify(error));
      return;
    }

    console.log(`Email sent to ${to}: ${subject} (${data?.id || 'ok'})`);
  } catch (error) {
    console.error('Email error:', error.message);
  }
};

module.exports = sendEmail;