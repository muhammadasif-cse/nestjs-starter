import { Module } from '@nestjs/common';
import { ServerModule } from '@/module/server/server.module';
import { DatabaseModule } from './database/database.module';
import { AuthService } from './module/auth/auth.service';
import { AuthController } from './module/auth/auth.controller';
import { AuthModule } from './module/auth/auth.module';
import { UserController } from './module/user/user.controller';
import { UserService } from './module/user/user.service';
import { UserModule } from './module/user/user.module';
import { SessionModule } from './module/session/session.module';

@Module({
  imports: [ServerModule, DatabaseModule, AuthModule, UserModule, SessionModule],
  providers: [AuthService, UserService],
  controllers: [AuthController, UserController],
})
export class AppModule {}
