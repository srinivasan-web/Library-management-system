const express = require('express');
const cors = require('cors');

const { config } = require('./config/env');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');
const memberRoutes = require('./routes/member');
const borrowRecordRoutes = require('./routes/borrowRecord');
const { notFoundHandler } = require('./middleware/notFoundHandler');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Library Management API is running',
    environment: config.env,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/borrow-records', borrowRecordRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
