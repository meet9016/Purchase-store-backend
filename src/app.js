const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const config = require('./config/env');

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: config.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', routes);

// 404 Not Found Catch-All
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
