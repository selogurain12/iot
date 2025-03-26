const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Express avec Swagger',
      version: '1.0.0',
      description: 'Documentation de l’API Express avec Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Remplace par l'URL de ton API
        description: 'Serveur local',
      },
    ],
    components: {
      securitySchemes: {
          BearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
          },
      },
  },
  security: [{ BearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Inclure tous les fichiers de routes
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;