import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'User associated with the session' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Hash of the session' })
  @IsNotEmpty()
  hash: string;
}
