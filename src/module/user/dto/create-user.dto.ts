import { AuthProvidersEnum } from '@/module/auth/enums/auth-providers.enum';
import { FileDto } from '@/module/file/dto/file.dto';
import { RoleDto } from '@/module/role/dto/role.dto';
import { StatusDto } from '@/module/status/dto/status.dto';
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'muhammadasif.cse@gmail.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Asif@123', type: String })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/\d/, { message: 'Password must contain at least 1 number' })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least 1 lowercase letter',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least 1 uppercase letter',
  })
  @Matches(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/, {
    message: 'Password must contain at least 1 special character',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Muhammad Asif' })
  @IsString()
  @MinLength(3, { message: 'Name should be at least 3 characters long' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name should only contain letters and spaces',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: AuthProvidersEnum.email })
  @IsEnum(AuthProvidersEnum)
  @IsNotEmpty()
  @IsString()
  provider: AuthProvidersEnum;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  providerId: number;

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
