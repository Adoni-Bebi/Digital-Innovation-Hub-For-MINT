const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const startupRoutes = require('./routes/startupRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Digital Innovation Hub API is running' });
});

module.exports = app;