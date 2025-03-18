import { ServerModule } from '@/module/server/server.module';
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { SeederModule } from './database/seeds/common/seeder.module';
import { AuthModule } from './module/auth/auth.module';
import { FileModule } from './module/file/file.module';
import { SessionModule } from './module/session/session.module';
import { UserModule } from './module/user/user.module';

@Module({
  imports: [
    SeederModule,
    ServerModule,
    FileModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    SessionModule,
  ],
})
export class AppModule {}
