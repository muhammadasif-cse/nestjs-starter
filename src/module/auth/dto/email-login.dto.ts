import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class EmailLoginDto {
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
}
