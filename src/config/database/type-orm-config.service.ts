import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const config = {
      type: this.configService.getOrThrow('database.type', { infer: true }),
      host: this.configService.getOrThrow('database.host', { infer: true }),
      port: this.configService.getOrThrow('database.port', { infer: true }),
      username: this.configService.getOrThrow('database.username', {
        infer: true,
      }),
      password: this.configService.getOrThrow('database.password', {
        infer: true,
      }),
      database: this.configService.getOrThrow('database.name', { infer: true }),
      synchronize: this.configService.getOrThrow('database.synchronize', {
        infer: true,
      }),
    };

    const sslEnabled =
      this.configService.getOrThrow('database.sslEnabled', { infer: true }) ===
      'true';

    const sslConfig = sslEnabled
      ? {
          rejectUnauthorized:
            this.configService.getOrThrow('database.rejectUnauthorized', {
              infer: true,
            }) === 'true',
          ca: this.configService.getOrThrow('database.ca', { infer: true }),
          key: this.configService.getOrThrow('database.key', { infer: true }),
          cert: this.configService.getOrThrow('database.cert', { infer: true }),
        }
      : undefined;

    return {
      ...config,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      ssl: sslConfig,
    } as TypeOrmModuleOptions;
  }
}
