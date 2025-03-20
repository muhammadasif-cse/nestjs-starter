import {
  EXISTS,
  NOT_EXIST,
  NOT_FOUND,
  SUCCESS,
} from '@/common/constant/message.constant';
import { ActionEnum } from '@/common/enum/action.enum';
import { buildPagination } from '@/utils/pagination.utils';
import { APIResponse } from '@/utils/types/api-response';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { FileService } from '../file/file.service';
import { RoleEnum } from '../role/enum/role.enum';
import { StatusEnum } from '../status/enum/status.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { QueryHelperService } from '@/common/services/query-helper/query-helper.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly queryHelperService: QueryHelperService,
    private readonly fileService: FileService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<APIResponse<UserEntity>> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let password: string | undefined;
      if (createUserDto.password) {
        password = await bcrypt.hash(createUserDto.password, 10);
      }

      let email: string | undefined = undefined;
      if (createUserDto.email) {
        const userObject = await this.userRepository.findOne({
          where: { email: createUserDto.email },
        });
        if (userObject) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            success: false,
            message: EXISTS('Email'),
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
            message: NOT_FOUND('Image'),
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
            message: NOT_EXIST('Role'),
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
            message: NOT_EXIST('Status'),
            error: 'status_not_exists',
            timestamp: new Date().toISOString(),
            locale: 'en-US',
          });
        }
        status = { id: createUserDto.status.id };
      }

      const user = this.userRepository.create({
        name: createUserDto.name,
        email: email,
        password: password,
        photo: photo,
        role: role,
        status: status,
        provider: createUserDto.provider ?? 'email',
        providerId: createUserDto.providerId ?? null,
      });

      await this.userRepository.save(user);
      await queryRunner.commitTransaction();

      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: SUCCESS(ActionEnum.CREATE, 'User'),
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
    filters?: { search?: string },
  ): Promise<APIResponse<UserEntity[]>> {
    const { search } = filters || {};

    // Create a query builder using userRepository
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply pagination, search, and sorting
    this.queryHelperService.applyPaginationAndSearch(
      queryBuilder,
      {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
        sort: sortOptions?.[0]
          ? `${sortOptions[0].field}:${sortOptions[0].order}`
          : undefined,
        search,
      },
      ['user.name', 'user.email'],
      search,
    );

    // Execute the query
    const [users, total] = await queryBuilder.getManyAndCount();

    // Throw an error if no users are found
    if (users.length === 0) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: NOT_FOUND('User'),
        error: 'not_found',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    // Build the response
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.GET, 'Users'),
      data: users,
      pagination: buildPagination(
        total,
        paginationOptions.page,
        paginationOptions.limit,
        sortOptions?.[0]?.field,
        sortOptions?.[0]?.order,
        search,
        filters,
      ),
      links: {},
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  async findById(id: string): Promise<APIResponse<UserEntity>> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: NOT_FOUND('User'),
        error: 'not_found',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.GET, 'User'),
      data: user,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  async findByEmail(email: string): Promise<APIResponse<UserEntity>> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: NOT_FOUND('User'),
        error: 'not_found',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.GET, 'User'),
      data: user,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<APIResponse<UserEntity>> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          success: false,
          message: NOT_FOUND('User'),
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
            message: NOT_FOUND('Image'),
            error: 'imageNotExists',
            timestamp: new Date().toISOString(),
            locale: 'en-US',
          });
        }
      }

      Object.assign(user, updateUserDto);
      await this.userRepository.save(user);
      await queryRunner.commitTransaction();

      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: SUCCESS(ActionEnum.UPDATE, 'User'),
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
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: NOT_FOUND('User'),
        error: 'notFound',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    await this.userRepository.remove(user);

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DELETE, 'User'),
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }
}
