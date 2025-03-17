import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { AppModule } from './app.module';

// * load env for global usage
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  // * enable CORS
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // * serve static files
  app.useStaticAssets(
    join(process.cwd(), process.env.FILE_UPLOAD_DESTINATION ?? ''),
    {
      prefix: process.env.FILE_UPLOAD_DESTINATION,
    },
  );

  // * enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // * set global prefix
  app.setGlobalPrefix(`${process.env.API_PREFIX}/${process.env.APP_VERSION}`, {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  // * enable swagger and configure
  const config = new DocumentBuilder()
    .setTitle(process.env.APP_NAME || 'Server')
    .setDescription(process.env.APP_DESCRIPTION || '')
    .addBearerAuth()
    .addTag('API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // * start server
  await app.listen(process.env.APP_PORT ?? 3000);
}

bootstrap().then((r) => r);
