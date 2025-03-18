import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSessionDto {
  @ApiProperty({ description: 'Hash of the session', required: false })
  @IsOptional()
  @IsString()
  hash?: string;
}
