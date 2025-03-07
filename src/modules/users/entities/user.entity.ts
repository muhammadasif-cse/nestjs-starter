import { AuthProvidersEnum } from '@/auth/auth-providers.enum';
import { FileEntity } from '@/files/infrastructure/persistence/entities/file.entity';
import { RoleEntity } from '@/roles/entities/role.entity';
import { StatusEntity } from '@/statuses/entities/status.entity';
import { EntityHelper } from '@/utils/entity-helper';
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
export class UserEntity extends EntityHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: String, unique: true, nullable: true })
  email: string | null;

  @Column({ nullable: true })
  password?: string;

  @Column({ default: AuthProvidersEnum.email })
  provider: string;

  @Index()
  @Column({ type: String, nullable: true })
  socialId?: string | null;

  @Index()
  @Column({ type: String, nullable: true })
  firstName: string | null;

  @Index()
  @Column({ type: String, nullable: true })
  lastName: string | null;

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
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
