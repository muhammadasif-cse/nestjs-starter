import { FileEntity } from '@/files/infrastructure/persistence/entities/file.entity';
import { UserEntity } from '@/modules/users/entities/user.entity';
import { RoleEntity } from '@/roles/entities/role.entity';
import { SessionEntity } from '@/session/entities/session.entity';
import { StatusEntity } from '@/statuses/entities/status.entity';
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
      dropSchema: false,
      keepConnectionAlive: true,
      logging:
        this.configService.get('app.nodeEnv', { infer: true }) !== 'production',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      cli: {
        entitiesDir: 'src',

        subscribersDir: 'subscriber',
      },
      extra: {
        max: this.configService.get('database.maxConnections', { infer: true }),
        ssl: this.configService.get('database.sslEnabled', { infer: true })
          ? {
              rejectUnauthorized: this.configService.get(
                'database.rejectUnauthorized',
                { infer: true },
              ),
              ca:
                this.configService.get('database.ca', { infer: true }) ??
                undefined,
              key:
                this.configService.get('database.key', { infer: true }) ??
                undefined,
              cert:
                this.configService.get('database.cert', { infer: true }) ??
                undefined,
            }
          : undefined,
      },
    };
    return {
      ...config,
      entities: [
        UserEntity,
        FileEntity,
        RoleEntity,
        StatusEntity,
        SessionEntity,
      ],
    } as TypeOrmModuleOptions;
  }
}
