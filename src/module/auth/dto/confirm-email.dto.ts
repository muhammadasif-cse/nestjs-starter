import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hash: string;
}
