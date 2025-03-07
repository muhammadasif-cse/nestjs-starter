import { Roles } from '@/roles/roles.decorator';
import { RoleEnum } from '@/roles/roles.enum';
import { RolesGuard } from '@/roles/roles.guard';
import { APIResponse } from '@/utils/types/api-response';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { User } from './domain/user';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @SwaggerApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
    schema: {
      example: {
        statusCode: 201,
        message: 'User created successfully',
        data: {
          id: 'uuid-string',
          email: 'test1@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 422,
    description: 'Email already exists or invalid data',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<APIResponse<User>> {
    const user = await this.usersService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: user,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  @ApiQuery({
    name: 'filters',
    required: false,
    type: 'object',
    description: 'page=1&filters.role.id=1&limit=10&filters.firstName=Admin',
    schema: {
      example: {
        'filters.firstName': 'Admin',
        'filters.role.id': '1',
      },
    },
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: [
          {
            id: 'uuid-string',
            email: 'test1@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
        ],
        meta: {
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
          itemsPerPage: 10,
          sortBy: 'createdAt',
          sortOrder: 'ASC',
        },
      },
    },
  })
  async findAll(@Query() query: any) {
    const { users, total } = await this.usersService.findAll({
      rawQuery: query,
      sortOptions: query.sort ? JSON.parse(query.sort) : null,
      paginationOptions: {
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 10,
      },
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data: users,
      meta: {
        totalItems: total,
        currentPage: query.page ?? 1,
        totalPages: Math.ceil(total / (query.limit ?? 10)),
        itemsPerPage: query.limit ?? 10,
        sortBy: query.sort?.[0]?.orderBy || 'createdAt',
        search: query.filters?.search,
        sortOrder: query.sort?.[0]?.order || 'ASC',
        appliedFilters: query.filters,
      },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a user by ID' })
  @SwaggerApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User,
    schema: {
      example: {
        statusCode: 200,
        message: 'User retrieved successfully',
        data: {
          id: 'uuid-string',
          email: 'test1@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(@Param('id') id: string): Promise<APIResponse<User>> {
    const user = await this.usersService.findById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user by ID' })
  @SwaggerApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
    schema: {
      example: {
        statusCode: 200,
        message: 'User updated successfully',
        data: {
          id: 'uuid-string',
          email: 'new@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
      },
    },
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  @SwaggerApiResponse({
    status: 422,
    description: 'Email already exists or invalid data',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<APIResponse<User>> {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @SwaggerApiResponse({
    status: 204,
    description: 'User deleted successfully',
    schema: {
      example: {
        statusCode: 204,
        message: 'User deleted successfully',
      },
    },
  })
  @SwaggerApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id') id: string): Promise<APIResponse<void>> {
    await this.usersService.remove(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User deleted successfully',
    };
  }
}
