import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../file/entities/file.entity';
import { FileService } from '../file/file.service';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { QueryHelperService } from '@/common/services/query-helper/query-helper.service';
import { JwtService } from '@nestjs/jwt';
import { MailModule } from '@/mail/mail.module';

@Module({
  imports: [MailModule, TypeOrmModule.forFeature([UserEntity, FileEntity])],
  controllers: [UserController],
  providers: [UserService, FileService, QueryHelperService, JwtService],
  exports: [UserService],
})
export class UserModule {}
