import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  console.log('🔄 Starting application bootstrap...');
  console.log('📊 Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    FRONTEND_URL: process.env.FRONTEND_URL || 'Not set',
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Configure CORS origins based on environment
  const allowedOrigins = ['http://localhost:3001', 'http://127.0.0.1:3001'];

  // Add production frontend URL if configured
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  console.log('🔧 Allowed CORS origins:', allowedOrigins);

  // Enable CORS for frontend with dynamic origin check
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      if (origin.includes('.vercel.app')) {
        return callback(null, true);
      }

      // Reject other origins
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global prefix for API
  app.setGlobalPrefix('api');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('RetailOS API')
    .setDescription('The RetailOS API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);

  // Try to bind IPv6 first, then fallback to IPv4 — this adds dual-stack support
  const hostsToTry = ['::', '0.0.0.0'];
  let boundHost: string | null = null;

  for (const host of hostsToTry) {
    try {
      console.log(`🔌 Attempting to bind to ${host}:${port}...`);
      await app.listen(port, host);
      boundHost = host;
      console.log(`✅ Successfully bound to ${host}:${port}`);
      console.log(`🚀 Application is running on: http://${host}:${port}/api`);
      console.log(`📚 Swagger docs: http://${host}:${port}/api/docs`);
      console.log(`💚 Health check: http://${host}:${port}/api/health`);
      break;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  Could not bind to ${host}: ${err?.message ?? err}`);
    }
  }

  if (!boundHost) {
    console.error('❌ Failed to bind to any host. Exiting.');
    process.exit(1);
  }

  // Log the actual server address information (may reveal IPv4/IPv6 details)
  try {
    // `getHttpServer().address()` is provided by the underlying Node server
    const server: any = app.getHttpServer();
    const addr = typeof server.address === 'function' ? server.address() : null;
    console.log('📡 Server address info:', addr);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Unable to retrieve server address info', err);
  }

  console.log('✨ Application bootstrap completed successfully!');
}
bootstrap().catch((err) => {
  console.error('❌ Failed to bootstrap application:', err);
  process.exit(1);
});
