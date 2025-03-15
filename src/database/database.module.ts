import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import path from 'path';
import { config } from 'dotenv';
config({ path: path.join(process.cwd(), '.env') });

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number(process.env.DATABASE_PORT) || 3306,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
        migrations: [path.join(__dirname, '/../migrations/*{.ts,.js}')],
        cli: {
          migrationsDir: 'src/migrations',
        },
        synchronize: true,
        logging: process.env.NODE_ENV === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}
