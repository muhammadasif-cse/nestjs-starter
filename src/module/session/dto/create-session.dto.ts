import { UserEntity } from '@/module/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'User associated with the session' })
  @IsNotEmpty()
  user: UserEntity;

  @ApiProperty({ description: 'Hash of the session' })
  @IsNotEmpty()
  hash: string;
}
