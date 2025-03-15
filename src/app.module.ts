import { Module } from '@nestjs/common';
import { ServerModule } from '@/module/server/server.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [ServerModule, DatabaseModule],
})
export class AppModule {}
