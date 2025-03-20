import { buildLinks } from '@/utils/pagination.utils';
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
import { ApiOperation } from '@nestjs/swagger';
import { RoleEnum } from '../role/enum/role.enum';
import { Role } from '../role/role.decorator';
import { RoleGuard } from '../role/role.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('users')
@Role(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<APIResponse<UserEntity>> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
  ): Promise<APIResponse<UserEntity[]>> {
    const sortOptions = sort ? JSON.parse(sort) : [];

    const response = await this.userService.findAll(
      { page: Number(page), limit: Number(limit) },
      sortOptions,
      { search },
    );

    response.links = buildLinks(
      '/users',
      Number(page),
      response.pagination?.totalPages || 1,
      Number(limit),
    );

    return response;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<APIResponse<UserEntity>> {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a user by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<APIResponse<UserEntity>> {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user by ID' })
  async remove(@Param('id') id: string): Promise<APIResponse<void>> {
    return await this.userService.remove(id);
  }
}
