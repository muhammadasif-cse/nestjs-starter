import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'muhammadasif.cse@gmail.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsString()
  @IsEmail()
  email: string;
}
