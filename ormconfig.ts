import { config } from 'dotenv';
import path from 'path';
import 'tsconfig-paths/register';
import { DataSource } from 'typeorm';

config({ path: path.join(process.cwd(), '.env') });

module.exports = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [path.join(__dirname, 'src/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'src/database/migrations/*{.ts,.js}')],
  synchronize: process.env.NODE_ENV === 'development',
  logging: true,
  migrationsRun: false,
});
