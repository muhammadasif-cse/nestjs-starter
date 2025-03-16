import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hash: string;
}
