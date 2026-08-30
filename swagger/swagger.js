const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'EventPulse API',
      version: '1.0.0',
      description:
        'Event Management Backend API — events, categories, authentication, registrations, real-time announcements.',
    },

    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
      {
        url: 'https://30907081204004-event-pulse.vercel.app',
        description: 'Production Server (Vercel)',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  apis: [`${__dirname}/../routes/*.js`],
};

module.exports = swaggerJSDoc(options);