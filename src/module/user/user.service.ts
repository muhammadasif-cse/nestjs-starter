import { buildPagination } from '@/utils/pagination.utils';
import { APIResponse } from '@/utils/types/api-response';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { FileService } from '../file/file.service';
import { RoleEnum } from '../role/enum/role.enum';
import { StatusEnum } from '../status/enum/status.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly fileService: FileService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<APIResponse<UserEntity>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let password: string | undefined;
      if (createUserDto.password) {
        password = await bcrypt.hash(createUserDto.password, 10);
      }

      let email: string | undefined = undefined;
      if (createUserDto.email) {
        const userObject = await queryRunner.manager.findOne(UserEntity, {
          where: { email: createUserDto.email },
        });
        if (userObject) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            success: false,
            message: 'Email already exists',
            error: 'email_already_exists',
            timestamp: new Date().toISOString(),
            locale: 'en-US',
          });
        }
        email = createUserDto.email ?? undefined;
      }

      let photo: any | null | undefined;
      if (createUserDto.photo?.id) {
        const fileObject = await this.fileService.findOne(
          createUserDto.photo.id,
        );
        if (!fileObject) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            success: false,
            message: 'Image not found',
            error: 'image_not_found',
            timestamp: new Date().toISOString(),
            locale: 'en-US',
          });
        }
        photo = fileObject;
      } else if (createUserDto.photo === null) {
        photo = null;
      }

      let role: any | undefined;
      if (createUserDto.role?.id) {
        const validRole = Object.values(RoleEnum).includes(
          createUserDto.role.id,
        );
        if (!validRole) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            success: false,
            message: 'Role does not exist',
            error: 'role_not_exists',
            timestamp: new Date().toISOString(),
            locale: 'en-US',
          });
        }
        role = { id: createUserDto.role.id };
      }

      let status: any | undefined;
      if (createUserDto.status?.id) {
        const validStatus = Object.values(StatusEnum).includes(
          createUserDto.status.id,
        );
        if (!validStatus) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            success: false,
            message: 'Status does not exist',
            error: 'status_not_exists',
            timestamp: new Date().toISOString(),
            locale: 'en-US',
          });
        }
        status = { id: createUserDto.status.id };
      }

      const user = queryRunner.manager.create(UserEntity, {
        name: createUserDto.name,
        email: email,
        password: password,
        photo: photo,
        role: role,
        status: status,
        provider: createUserDto.provider ?? 'email',
        providerId: createUserDto.providerId ?? null,
      });

      await queryRunner.manager.save(UserEntity, user);
      await queryRunner.commitTransaction();

      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: 'User created successfully',
        data: user,
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    paginationOptions: { page: number; limit: number },
    sortOptions?: { field: string; order: 'asc' | 'desc' }[],
    filters?: any,
  ): Promise<APIResponse<UserEntity[]>> {
    const [users, total] = await this.dataSource.manager.findAndCount(
      UserEntity,
      {
        skip: (paginationOptions.page - 1) * paginationOptions.limit,
        take: paginationOptions.limit,
        order: sortOptions?.reduce((acc, sort) => {
          acc[sort.field] = sort.order;
          return acc;
        }, {}),
        where: filters,
      },
    );

    if (users.length === 0) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: 'No users found',
        error: 'not_found',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      pagination: buildPagination(
        total,
        paginationOptions.page,
        paginationOptions.limit,
        sortOptions?.[0]?.field,
        sortOptions?.[0]?.order,
        filters?.search,
        filters,
      ),
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  async findById(id: string): Promise<APIResponse<UserEntity>> {
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: { id },
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: 'User not found',
        error: 'not_found',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<APIResponse<UserEntity>> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(UserEntity, {
        where: { id },
      });
      if (!user) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          success: false,
          message: 'User not found',
          error: 'notFound',
          timestamp: new Date().toISOString(),
          locale: 'en-US',
        });
      }

      if (updateUserDto.photo?.id) {
        const fileObject = await this.fileService.findOne(
          updateUserDto.photo.id,
        );
        if (!fileObject) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            success: false,
            message: 'Image not found',
            error: 'imageNotExists',
            timestamp: new Date().toISOString(),
            locale: 'en-US',
          });
        }
      }

      Object.assign(user, updateUserDto);
      await queryRunner.manager.save(UserEntity, user);
      await queryRunner.commitTransaction();

      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'User updated successfully',
        data: user,
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<APIResponse<void>> {
    const user = await this.dataSource.manager.findOne(UserEntity, {
      where: { id },
    });
    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: 'User not found',
        error: 'notFound',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    await this.dataSource.manager.remove(UserEntity, user);

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }
}
