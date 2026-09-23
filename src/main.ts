import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { PostgresExceptionFilter } from './common/filters/postgres-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Security & Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
    }),
  );

  app.enableCors();

  // 2. Serve Static Assets (public files and uploaded avatars)
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 3. Global Filters & Pipes
  app.useGlobalFilters(new PostgresExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 4. Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Robo Advisor API')
    .setDescription('Robo Advisor Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 5. Start Server
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}

bootstrap();