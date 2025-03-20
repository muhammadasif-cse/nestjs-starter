import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from '../file/entities/file.entity';
import { FileService } from '../file/file.service';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { QueryHelperService } from '@/common/services/query-helper/query-helper.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FileEntity])],
  controllers: [UserController],
  providers: [UserService, FileService, QueryHelperService],
  exports: [UserService, FileService, QueryHelperService],
})
export class UserModule {}
