import { AuthProvidersEnum } from '@/module/auth/enums/auth-providers.enum';
import { FileEntity } from '@/module/file/entities/file.entity';
import { RoleEntity } from '@/module/role/entities/role.entity';
import { StatusEntity } from '@/module/status/entities/status.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: String })
  name: string;

  @Index()
  @Column({ type: String, unique: true })
  email: string;

  @Column({ type: String })
  password: string;

  @Column({ default: AuthProvidersEnum.email })
  provider: string;

  @Index()
  @Column({ type: String })
  providerId: string;

  @OneToOne(() => FileEntity, { eager: true })
  @JoinColumn()
  photo?: FileEntity | null;

  @ManyToOne(() => RoleEntity, { eager: true })
  role?: RoleEntity | null;

  @ManyToOne(() => StatusEntity, { eager: true })
  status?: StatusEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date | null;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
