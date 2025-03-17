import { UserEntity } from '@/module/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class SessionDto {
  @ApiProperty({ description: 'Unique identifier of the session' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'User associated with the session' })
  user: UserEntity;

  @ApiProperty({ description: 'Hash of the session' })
  hash: string;

  @ApiProperty({ description: 'The creation date of the session' })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update date of the session',
    nullable: true,
  })
  updatedAt: Date | null;

  @ApiProperty({
    description: 'The deletion date of the session',
    nullable: true,
  })
  deletedAt: Date | null;
}
