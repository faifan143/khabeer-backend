"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const compression = require("compression");
const path_1 = require("path");
const fs_1 = require("fs");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    app.use(compression());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        errorHttpStatusCode: 422,
    }));
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['*'],
        credentials: true,
        maxAge: 86400,
    });
    const uploadsPath = (0, path_1.join)(process.cwd(), 'uploads');
    logger.log(`Setting up static file serving from: ${uploadsPath}`);
    app.useStaticAssets(uploadsPath, {
        prefix: '/uploads/',
        setHeaders: (res, path) => {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.set('Access-Control-Allow-Headers', '*');
            res.set('Access-Control-Allow-Credentials', 'true');
            res.set('Cache-Control', 'public, max-age=31536000');
            logger.log(`Serving static file: ${path}`);
        }
    });
    const publicPath = (0, path_1.join)(process.cwd(), 'public');
    if ((0, fs_1.existsSync)(publicPath)) {
        logger.log(`Setting up public file serving from: ${publicPath}`);
        app.useStaticAssets(publicPath, {
            setHeaders: (res, path) => {
                res.set('Access-Control-Allow-Origin', '*');
                logger.log(`Serving public file: ${path}`);
            }
        });
    }
    app.setGlobalPrefix('api', {
        exclude: ['/health', '/docs', '/uploads'],
    });
    if (configService.get('NODE_ENV') !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Khabeer API')
            .setDescription('Professional service marketplace API for connecting users with service providers')
            .setVersion(configService.get('APP_VERSION', '1.0.0'))
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
        }, 'JWT-auth')
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
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                showRequestHeaders: true,
            },
            customSiteTitle: 'Khabeer API Documentation',
        });
    }
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach((signal) => {
        process.on(signal, async () => {
            logger.log(`Received ${signal}, starting graceful shutdown...`);
            await app.close();
            logger.log('Application closed successfully');
            process.exit(0);
        });
    });
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        process.exit(1);
    });
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
//# sourceMappingURL=main.js.map