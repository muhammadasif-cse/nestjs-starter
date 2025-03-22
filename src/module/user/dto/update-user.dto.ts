import { FileDto } from '@/module/file/dto/file.dto';
import { RoleDto } from '@/module/role/dto/role.dto';
import { StatusDto } from '@/module/status/dto/status.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MinLength,
  IsEmail,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Muhammad Asif' })
  @IsString()
  @MinLength(3, { message: 'Name should be at least 3 characters long' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name should only contain letters and spaces',
  })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'newpassword123!' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'oldpassword123!' })
  @IsString()
  @IsOptional()
  oldPassword?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '01930248584' })
  @IsNumber()
  @IsOptional()
  phone?: number;

  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ type: () => RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;
}
