import { Module } from '@nestjs/common';
import { ServerController } from '@/module/server/server.controller';
import { ServerService } from '@/module/server/server.service';

@Module({
  controllers: [ServerController],
  providers: [ServerService],
  exports: [ServerService],
})
export class ServerModule {}
