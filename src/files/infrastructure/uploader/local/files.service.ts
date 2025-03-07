import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AllConfigType } from '../../../../config/config.type';
import { FileType } from '../../../domain/file';
import { FileRepository } from '../../persistence/file.repository';

@Injectable()
export class FilesLocalService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly fileRepository: FileRepository,
  ) {}

  async create(file: Express.Multer.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      });
    }

    const apiPrefix = this.configService.get('app.apiPrefix', { infer: true });
    const version = this.configService.get('app.version', { infer: true });
    let filePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
    filePath = filePath.replace(/\\/g, '/');
    return {
      file: await this.fileRepository.create({
        path: `/${apiPrefix}/${version}/${filePath}`,
      }),
    };
  }
}
