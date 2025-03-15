import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // * import dotenv for environment variables
  const dotenv = await import('dotenv');
  dotenv.config();

  // * start server
  await app.listen(process.env.APP_PORT ?? 3000);
}

bootstrap().then((r) => r);
