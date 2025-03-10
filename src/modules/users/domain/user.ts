import { FileType } from '@/files/domain/file';
import { Role } from '@/roles/domain/role';
import { Status } from '@/statuses/domain/status';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class User {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ type: String, example: 'john.doe@example.com' })
  @Expose({ groups: ['me', 'admin'] })
  email: string | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @ApiProperty({ type: String, example: 'email' })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({ type: String, example: '1234567890' })
  @Expose({ groups: ['me', 'admin'] })
  socialId?: string | null;

  @ApiProperty({ type: String, example: 'John' })
  firstName: string | null;

  @ApiProperty({ type: String, example: 'Doe' })
  lastName: string | null;

  @ApiProperty({ type: () => FileType })
  photo?: FileType | null;

  @ApiProperty({ type: () => Role })
  role?: Role | null;

  @ApiProperty({ type: () => Status })
  status?: Status;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date | null;
}
