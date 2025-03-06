import {
  // common
  Module,
} from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { FileConfig, FileDriver } from './config/file-config.type';
import fileConfig from './config/file.config';
import { FilesService } from './files.service';
import { FileEntity } from './infrastructure/persistence/entities/file.entity';
import { FilePersistenceModule } from './infrastructure/persistence/persistence.module';
import { FilesLocalModule } from './infrastructure/uploader/local/files.module';
import { FilesS3PresignedModule } from './infrastructure/uploader/s3-presigned/files.module';

const infrastructureUploaderModule =
  (fileConfig() as FileConfig).driver === FileDriver.LOCAL
    ? FilesLocalModule
    : FilesS3PresignedModule;

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    FilePersistenceModule,
    infrastructureUploaderModule,
  ],
  providers: [FilesService],
  exports: [FilesService, FilePersistenceModule],
})
export class FilesModule {}
