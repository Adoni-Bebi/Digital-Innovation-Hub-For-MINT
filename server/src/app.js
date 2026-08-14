const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const startupRoutes = require('./routes/startupRoutes');
const accessRequestRoutes = require('./routes/accessRequestRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const sendEmail = require('./utils/sendEmail');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Digital Innovation Hub API is running' });
});

// TEMP test route — remove later
app.get('/api/test-email', async (req, res) => {
  const to = req.query.to || process.env.EMAIL_USER || 'mint.dih.ethiopia@gmail.com';

  console.log('TEST EMAIL route hit, sending to:', to);

  const result = await sendEmail({
    to,
    subject: 'DIH Test Email',
    html: '<p>This is a test email from Digital Innovation Hub on Render + Brevo.</p>',
  });

  res.json({
    success: !!result.ok,
    to,
    result,
    smtp: {
      host: process.env.SMTP_HOST || null,
      userSet: !!process.env.SMTP_USER,
      passSet: !!process.env.SMTP_PASS,
      from: process.env.EMAIL_FROM || null,
    },
  });
});

app.use((err, req, res, next) => {
  if (err instanceof require('multer').MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large (max 10MB)' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message && err.message.includes('File type not allowed')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

module.exports = app;