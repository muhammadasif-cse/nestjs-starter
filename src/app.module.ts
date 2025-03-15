import { Module } from '@nestjs/common';
import { ServerModule } from '@/module/server/server.module';

@Module({
  imports: [ServerModule],
})
export class AppModule {}
