import { FileDto } from '@/files/dto/file.dto';
import { RoleDto } from '@/roles/dto/role.dto';
import { StatusDto } from '@/statuses/dto/status.dto';
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'asif@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string | null;

  @ApiProperty()
  @MinLength(6)
  password?: string;

  provider?: string;

  socialId?: string | null;

  @ApiProperty({ example: 'Muhammad', type: String })
  @IsNotEmpty()
  firstName: string | null;

  @ApiProperty({ example: 'Asif', type: String })
  @IsNotEmpty()
  lastName: string | null;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ type: RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;

  @ApiPropertyOptional({ type: StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto | null;
}
