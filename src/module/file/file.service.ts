import {
  NOT_FOUND,
  NOT_FOUND_ERROR,
  SUCCESS,
} from '@/common/constant/message.constant';
import { ActionEnum } from '@/common/enum/action.enum';
import { APIResponse } from '@/utils/types/api-response';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async create(file: Express.Multer.File): Promise<APIResponse<FileEntity>> {
    // * file directory
    const fileDir = join(process.cwd(), 'uploads');
    console.log(
      'process.env.FILE_UPLOAD_FOLDER',
      process.env.FILE_UPLOAD_FOLDER,
    );

    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }
    const filename = file.filename ?? `${Date.now()}-${file.originalname}`;
    const filePath = join(fileDir, filename);
    if ('buffer' in file) {
      fs.writeFileSync(filePath, file.buffer);
    }

    // * request file data
    const newFile = this.fileRepository.create({
      filename: filename,
      path: `/uploads/${filename}`,
      mimetype: file.mimetype,
      size: file.size,
    });

    // * save file to database
    await this.fileRepository.save(newFile);
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: SUCCESS(ActionEnum.CREATE, 'file'),
      data: newFile,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  async findAll(): Promise<APIResponse<FileEntity[]>> {
    const files = await this.fileRepository.find();

    // * check if files exist
    if (!files) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: 'Files not found',
        error: "Files don't exist",
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Files retrieved successfully',
      data: files,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  async findOne(id: string): Promise<APIResponse<FileEntity>> {
    const file = await this.fileRepository.findOne({ where: { id } });

    // * check if file exist
    if (!file) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: NOT_FOUND('file'),
        error: NOT_FOUND_ERROR('file'),
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.GET, 'file'),
      data: file,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  async update(
    id: string,
    updateFile: Express.Multer.File,
  ): Promise<APIResponse<FileEntity>> {
    // * check if file exist
    const file = await this.findOne(id);
    if (!file) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: NOT_FOUND('file'),
        error: NOT_FOUND_ERROR('file'),
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      };
    }

    // * check file data structure
    const { data } = file as APIResponse<FileEntity>;
    if (Array.isArray(data)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: 'Invalid file data',
        error: 'Expected a single file entity but received an array',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      };
    }

    // * get old file on directory
    const oldFilePath = join(process.cwd(), 'uploads', data?.filename ?? '');

    // * delete old file from storage
    if (fs.existsSync(oldFilePath)) {
      try {
        fs.unlinkSync(oldFilePath);
      } catch (error) {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          message: 'Error deleting file',
          error: error.message,
          timestamp: new Date().toISOString(),
          locale: 'en-US',
        };
      }
    }

    // * upload new file
    const filename =
      updateFile.filename ?? `${Date.now()}-${updateFile.originalname}`;

    const filePath = join(process.cwd(), 'uploads', filename);

    if ('buffer' in updateFile) {
      fs.writeFileSync(filePath, updateFile.buffer);
    }

    // * update file data
    if (data) {
      data.filename = filename;
      data.path = `/uploads/${filename}`;
      data.mimetype = updateFile.mimetype;
      data.size = updateFile.size;
    }

    if (data) {
      await this.fileRepository.save(data);
    }

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.UPDATE, 'file'),
      data: data,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  async remove(id: string): Promise<APIResponse<FileEntity>> {
    // * check if file exist
    const file = await this.findOne(id);
    if (!file) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: NOT_FOUND('file'),
        error: NOT_FOUND_ERROR('file'),
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      };
    }

    // * check file data structure
    const { data } = file as APIResponse<FileEntity>;
    if (Array.isArray(data)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: 'Invalid file data',
        error: 'Expected a single file entity but received an array',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      };
    }

    // * get file path
    const filePath = join(process.cwd(), 'uploads', data?.filename ?? '');

    // * delete file from storage
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          success: false,
          message: 'Error deleting file',
          error: error.message,
          timestamp: new Date().toISOString(),
          locale: 'en-US',
        };
      }
    }

    // * delete file from database
    if (data) {
      await this.fileRepository.remove(data);
    }

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DELETE, 'file'),
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }
}
