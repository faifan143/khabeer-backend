import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Get configuration service
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: configService.get('HELMET_CONTENT_SECURITY_POLICY_ENABLED', 'true') === 'true' ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    } : false,
    crossOriginEmbedderPolicy: false,
  }));

  // Compression middleware
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: configService.get('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes default
    max: configService.get('RATE_LIMIT_MAX_REQUESTS', 100), // limit each IP to 100 requests per windowMs
    message: {
      statusCode: 429,
      message: 'Too many requests from this IP, please try again later.',
      error: 'Too Many Requests',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 422,
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/health', '/docs'],
  });

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Khabeer API')
      .setDescription('Professional service marketplace API for connecting users with service providers')
      .setVersion(configService.get('APP_VERSION', '1.0.0'))
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Providers', 'Service provider management endpoints')
      .addTag('Services', 'Service management endpoints')
      .addTag('Categories', 'Service category management endpoints')
      .addTag('Orders', 'Order management endpoints')
      .addTag('Offers', 'Special offers and promotions endpoints')
      .addTag('Invoices', 'Invoice and payment management endpoints')
      .addTag('Ratings', 'Provider rating and review endpoints')
      .addTag('Files', 'File upload and management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showRequestHeaders: true,
      },
      customSiteTitle: 'Khabeer API Documentation',
    });
  }



  // Graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, starting graceful shutdown...`);
      await app.close();
      logger.log('Application closed successfully');
      process.exit(0);
    });
  });

  // Unhandled exception handler
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  // Start the application
  const port = configService.get('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation available at: http://localhost:${port}/docs`);
  logger.log(`🏥 Health check available at: http://localhost:${port}/health`);
  logger.log(`🌍 Environment: ${configService.get('NODE_ENV', 'development')}`);
  logger.log(`⏰ Started at: ${new Date().toISOString()}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
