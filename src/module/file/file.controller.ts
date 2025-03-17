import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileEntity } from './entities/file.entity';
import { FileService } from './file.service';

@Controller({
  path: 'files',
  version: '1',
})
export class FileController {
  constructor(private readonly fileService: FileService) {}

  // * create file
  @Post()
  @ApiCreatedResponse({
    type: FileEntity,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 1 * 1024 * 1024, // 1 MB limit
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/gif',
          'image/webp',
          'image/svg+xml',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'File type not allowed. Allowed file types are: jpeg, png, jpg, gif, webp, svg',
            ),
            false,
          );
        }
      },
    }),
  )
  create(@UploadedFile() file: Express.Multer.File) {
    return this.fileService.create(file);
  }

  // * get all files
  @Get()
  @ApiResponse({
    status: 200,
    type: [FileEntity],
  })
  findAll() {
    return this.fileService.findAll();
  }

  // * get file by id
  @Get(':id')
  @ApiResponse({
    status: 200,
    type: FileEntity,
  })
  findOne(@Param('id') id: string) {
    return this.fileService.findOne(id);
  }

  // * update file by id
  @Patch(':id')
  @ApiCreatedResponse({
    type: FileEntity,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 1 * 1024 * 1024, // 1 MB limit
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/gif',
          'image/webp',
          'image/svg+xml',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'File type not allowed. Allowed file types are: jpeg, png, jpg, gif, webp, svg',
            ),
            false,
          );
        }
      },
    }),
  )
  update(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.fileService.update(id, file);
  }

  // * delete file by id
  @Delete(':id')
  @ApiResponse({
    status: 200,
    type: FileEntity,
  })
  remove(@Param('id') id: string) {
    return this.fileService.remove(id);
  }
}
