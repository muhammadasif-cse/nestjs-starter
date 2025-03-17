import { UserEntity } from '@/module/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateSessionDto {
  @ApiProperty({ description: 'User associated with the session' })
  @IsOptional()
  user?: UserEntity;

  @ApiProperty({ description: 'Hash of the session' })
  @IsOptional()
  hash?: string;
}
