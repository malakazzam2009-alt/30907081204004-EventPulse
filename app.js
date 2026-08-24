const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const mongoSanitize = require('express-mongo-sanitize');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const healthRoutes = require('./routes/healthRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

/**
 * HTTP request logging
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/**
 * Middleware
 */
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
  })
);

app.use(express.json());
app.use(mongoSanitize());

/**
 * Health check
 */
app.use('/health', healthRoutes);

/**
 * Swagger specification
 */
let swaggerSpec;

try {
  swaggerSpec = require('./swagger/swagger');
  console.log('Swagger specification loaded successfully.');
} catch (err) {
  console.error('Failed to load Swagger specification:', err.message);
}

/**
 * Swagger JSON
 */
app.get('/api-docs/swagger.json', (req, res) => {
  if (!swaggerSpec) {
    return res.status(500).json({
      success: false,
      message: 'Swagger specification could not be loaded.',
    });
  }

  return res.status(200).json(swaggerSpec);
});

/**
 * Swagger UI
 */
if (swaggerSpec) {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customSiteTitle: 'EventPulse API',
    })
  );
} else {
  app.get('/api-docs', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Swagger specification could not be loaded.',
    });
  });
}

/**
 * API routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

/**
 * Root route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'EventPulse API is running.',
    docs: '/api-docs',
    swaggerJson: '/api-docs/swagger.json',
    health: '/health',
  });
});

/**
 * Error handling
 */
app.use(notFound);
app.use(errorHandler);

module.exports = app;