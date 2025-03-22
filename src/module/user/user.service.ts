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
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly queryHelperService: QueryHelperService,
    private readonly fileService: FileService,
    private mailService: MailService,
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

      const { password: userPassword, ...userData } = user;

      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        message: SUCCESS(ActionEnum.CREATE, 'User'),
        data: userData,
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

    // remove password from user object
    users.forEach((user) => {
      delete user.password;
    });

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

    // remove password from user object
    delete user.password;

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
    // remove password from user object
    delete user.password;
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

      // Check if user is active
      if (!user.isActive) {
        throw new UnprocessableEntityException({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          success: false,
          message: 'User account is not active',
          error: 'user_not_active',
          timestamp: new Date().toISOString(),
          locale: 'en-US',
        });
      }

      // Handle password update
      if (updateUserDto.password) {
        if (!user.password) {
          // First-time password setup
          const salt = await bcrypt.genSalt(10);
          updateUserDto.password = await bcrypt.hash(
            updateUserDto.password,
            salt,
          );
        } else {
          // Password update with existing password
          if (!updateUserDto.oldPassword) {
            throw new UnprocessableEntityException({
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              success: false,
              message: 'Missing old password for password update',
              error: 'missing_old_password',
              timestamp: new Date().toISOString(),
              locale: 'en-US',
            });
          }

          const isValidOldPassword = await bcrypt.compare(
            updateUserDto.oldPassword,
            user.password,
          );

          if (!isValidOldPassword) {
            throw new UnprocessableEntityException({
              statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
              success: false,
              message: 'Incorrect old password',
              error: 'incorrect_old_password',
              timestamp: new Date().toISOString(),
              locale: 'en-US',
            });
          }

          const salt = await bcrypt.genSalt(10);
          updateUserDto.password = await bcrypt.hash(
            updateUserDto.password,
            salt,
          );
        }
      } else {
        delete updateUserDto.password;
      }

      // Handle email update
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const userByEmail = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        });

        if (userByEmail && userByEmail.id !== user.id) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            success: false,
            message: 'Email already exists',
            error: 'email_exists',
            timestamp: new Date().toISOString(),
            locale: 'en-US',
          });
        }

        const hash = await this.jwtService.signAsync(
          {
            confirmEmailUserId: user.id,
            newEmail: updateUserDto.email,
          },
          {
            secret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
            expiresIn: process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
          },
        );

        await this.mailService.confirmNewEmail({
          to: updateUserDto.email,
          data: {
            hash,
            name: updateUserDto.name || '',
          },
        });

        // user status to inactive
        user.isActive = false;
        user.isVerified = false
        user.status = {
          id: StatusEnum.inactive,
          name: 'Inactive',
          description: 'User is inactive',
        };
        user.email = updateUserDto.email;

        delete updateUserDto.email;
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

      delete updateUserDto.oldPassword;

      // Update user with transaction
      Object.assign(user, updateUserDto);
      await this.userRepository.save(user);
      await queryRunner.commitTransaction();

      delete user.password;

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
        error: 'not_found',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    await this.userRepository.softDelete(id);

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DELETE, 'User'),
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }
}
