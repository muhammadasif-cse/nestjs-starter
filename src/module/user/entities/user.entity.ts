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

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: String })
  name: string;

  @Index()
  @Column({ type: String, unique: true, nullable: true })
  email: string | undefined;

  @Index()
  @Column({ type: Number, unique: true, nullable: true })
  phone: number | undefined;

  @Column({ type: String, nullable: true })
  address: string | undefined;

  @Column({ type: Boolean, default: false })
  isVerified: boolean;

  @Column({ type: Boolean, default: false })
  isActive: boolean;

  @Column({ type: String, nullable: true })
  password?: string;

  @Column({ default: AuthProvidersEnum.email })
  provider: string;

  @Index()
  @Column({ type: Number })
  providerId: number;

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
