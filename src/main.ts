import {
  ClassSerializerInterceptor,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { AllConfigType } from './config/config.type';
import { ResolvePromisesInterceptor } from './utils/serializer.interceptor';
import validationOptions from './utils/validation-options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);
  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  // Enable CORS
  app.enableCors({
    origin: `${process.env.FRONTEND_URL}`,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  // Enable API Versioning
  app.enableVersioning();
  // Set global prefix
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: [{ path: '/', method: RequestMethod.GET }],
    },
  );

  const config = new DocumentBuilder()
    .setTitle(configService.getOrThrow('app.name', { infer: true }))
    .setDescription(
      configService.getOrThrow('app.description', { infer: true }),
    )
    .addBearerAuth()
    .addTag('API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
bootstrap().catch((error) => {
  console.error('Error during bootstrap:', error);
});
