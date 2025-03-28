import { UserEntity } from '@/module/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  tokenExpires: number;

  @ApiProperty({
    type: () => UserEntity,
  })
  user: UserEntity;
}
