import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: false,
        migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
        cli: {
          migrationsDir: 'src/migrations',
        },
        namingStrategy:
          new (require('typeorm-naming-strategies').SnakeNamingStrategy)(),
      }),
      inject: [ConfigService],
    }),
    // Other modules
  ],
})
export class AppModule {}
