import { AuthProvidersEnum } from '@/auth/auth-providers.enum';
import { FileType } from '@/files/domain/file';
import { FilesService } from '@/files/files.service';
import { Role } from '@/roles/domain/role';
import { RoleEnum } from '@/roles/roles.enum';
import { Status } from '@/statuses/domain/status';
import { StatusEnum } from '@/statuses/statuses.enum';
import { FilterHelper } from '@/utils/filter.helper';
import { APIResponse } from '@/utils/types/api-response';
import { NullableType } from '@/utils/types/nullable.type';
import { IPaginationOptions } from '@/utils/types/pagination-options';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from './domain/user';
import { CreateUserDto } from './dto/create-user.dto';
import { SortUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly filesService: FilesService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    let password: string | undefined;
    if (createUserDto.password) {
      password = await bcrypt.hash(createUserDto.password, 10);
    }

    let email: string | null = null;
    if (createUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        createUserDto.email,
      );
      if (userObject) {
        throw new UnprocessableEntityException({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Email already exists',
          error: 'emailAlreadyExists',
        } as APIResponse<never>);
      }
      email = createUserDto.email;
    }

    let photo: FileType | null | undefined;
    if (createUserDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        createUserDto.photo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Image not found',
          error: 'imageNotExists',
        } as APIResponse<never>);
      }
      photo = fileObject;
    } else if (createUserDto.photo === null) {
      photo = null;
    }

    let role: Role | undefined;
    if (createUserDto.role?.id) {
      const validRole = Object.values(RoleEnum).includes(createUserDto.role.id);
      if (!validRole) {
        throw new UnprocessableEntityException({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Role does not exist',
          error: 'roleNotExists',
        } as APIResponse<never>);
      }
      role = { id: createUserDto.role.id };
    }

    let status: Status | undefined;
    if (createUserDto.status?.id) {
      const validStatus = Object.values(StatusEnum).includes(
        createUserDto.status.id,
      );
      if (!validStatus) {
        throw new UnprocessableEntityException({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Status does not exist',
          error: 'statusNotExists',
        } as APIResponse<never>);
      }
      status = { id: createUserDto.status.id };
    }

    return this.usersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email,
      password,
      photo,
      role,
      status,
      provider: createUserDto.provider ?? AuthProvidersEnum.email,
      socialId: createUserDto.socialId ?? null,
    });
  }

  async findAll({
    rawQuery,
    sortOptions,
    paginationOptions,
  }: {
    rawQuery: any;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<{ users: User[]; total: number }> {
    const filters = FilterHelper.parseQueryFilters(rawQuery);

    const userEntityFields = [
      'id',
      'email',
      'role',
      'status',
      'firstName',
      'lastName',
    ];

    const where = FilterHelper.buildTypeORMWhere<User>(
      filters,
      userEntityFields,
    );

    const { users, total } = await this.usersRepository.findAllWithPagination({
      where,
      sort: sortOptions ?? [],
      page: paginationOptions.page,
      limit: paginationOptions.limit,
    });

    if (users.length === 0) {
      throw new NotFoundException('No users found with the given filters.');
    }

    return { users, total };
  }

  async findById(id: string): Promise<NullableType<User>> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: 'notFound',
      } as APIResponse<never>);
    }
    return user;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    return this.usersRepository.findByIds(ids);
  }

  async findByEmail(email: string): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: string | null;
    provider: string;
  }): Promise<NullableType<User>> {
    return this.usersRepository.findBySocialIdAndProvider({
      socialId,
      provider,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const currentUser = await this.usersRepository.findById(id);
    if (!currentUser) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: 'notFound',
      } as APIResponse<never>);
    }

    let password: string | undefined;
    if (
      updateUserDto.password &&
      updateUserDto.password !== currentUser.password
    ) {
      password = await bcrypt.hash(updateUserDto.password, 10);
    }

    let email: string | null | undefined;
    if (updateUserDto.email !== undefined) {
      if (updateUserDto.email) {
        const userObject = await this.usersRepository.findByEmail(
          updateUserDto.email,
        );
        if (userObject && userObject.id !== id) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'Email already exists',
            error: 'emailAlreadyExists',
          } as APIResponse<never>);
        }
        email = updateUserDto.email;
      } else {
        email = null;
      }
    }

    let photo: FileType | null | undefined;
    if (updateUserDto.photo !== undefined) {
      if (updateUserDto.photo?.id) {
        const fileObject = await this.filesService.findById(
          updateUserDto.photo.id,
        );
        if (!fileObject) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'Image not found',
            error: 'imageNotExists',
          } as APIResponse<never>);
        }
        photo = fileObject;
      } else {
        photo = null;
      }
    }

    let role: Role | undefined;
    if (updateUserDto.role !== undefined) {
      if (updateUserDto.role?.id) {
        const validRole = Object.values(RoleEnum).includes(
          updateUserDto.role.id,
        );
        if (!validRole) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'Role does not exist',
            error: 'roleNotExists',
          } as APIResponse<never>);
        }
        role = { id: updateUserDto.role.id };
      } else {
        role = undefined;
      }
    }

    let status: Status | undefined;
    if (updateUserDto.status !== undefined) {
      if (updateUserDto.status?.id) {
        const validStatus = Object.values(StatusEnum).includes(
          updateUserDto.status.id,
        );
        if (!validStatus) {
          throw new UnprocessableEntityException({
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            message: 'Status does not exist',
            error: 'statusNotExists',
          } as APIResponse<never>);
        }
        status = { id: updateUserDto.status.id };
      } else {
        status = undefined;
      }
    }

    return this.usersRepository.update(id, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      email,
      password,
      photo,
      role,
      status,
      provider: updateUserDto.provider,
      socialId: updateUserDto.socialId ?? null,
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.remove(id);
  }
}
