import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS origins based on environment
  const allowedOrigins = ['http://localhost:3001', 'http://127.0.0.1:3001'];

  // Add production frontend URL if configured
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  // Enable CORS for frontend
  app.enableCors({
    origin: allowedOrigins,
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
      await app.listen(port, host);
      boundHost = host;
      console.log(`🚀 Application is running on: http://${host}:${port}/api`);
      console.log(`✅ Health check endpoint ready at: http://${host}:${port}/api/health`);
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
}
bootstrap().catch((err) => {
  console.error('❌ Failed to bootstrap application:', err);
  process.exit(1);
});
