require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

// Add process error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception - Server will stay running:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection - Server will stay running:', reason);
});

// Import routes
const contactsRoutes = require('./routes/contacts');
const propertiesRoutes = require('./routes/properties');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    body: req.method !== 'GET' ? req.body : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'HubSpot Assignment 2 API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/contacts', contactsRoutes);
app.use('/api/properties', propertiesRoutes);

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HubSpot Assignment 2 - Custom Properties & API Integration',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      properties: {
        status: 'GET /api/properties',
        setup: 'POST /api/properties/setup',
        getProperty: 'GET /api/properties/:name'
      },
      contacts: {
        create: 'POST /api/contacts',
        get: 'GET /api/contacts/:id',
        update: 'PATCH /api/contacts/:id',
        search: 'GET /api/contacts',
        delete: 'DELETE /api/contacts/:id',
        batchCreate: 'POST /api/contacts/batch'
      }
    },
    documentation: 'See README.md for detailed API documentation and examples'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  logger.success(`Server running on http://localhost:${PORT}`);
  logger.info('Available endpoints:');
  logger.info('- GET  /health');
  logger.info('- GET  /api/properties');
  logger.info('- POST /api/properties/setup');
  logger.info('- GET  /api/properties/:name');
  logger.info('- POST /api/contacts');
  logger.info('- GET  /api/contacts/:id');
  logger.info('- PATCH /api/contacts/:id');
  logger.info('- GET  /api/contacts (search)');
  logger.info('- DELETE /api/contacts/:id');
  logger.info('- POST /api/contacts/batch');
  logger.info('');
  logger.info('Make sure to:');
  logger.info('1. Copy .env.example to .env');
  logger.info('2. Add your HubSpot access token');
  logger.info('3. Run "npm run setup" to create custom properties');
});

module.exports = app;