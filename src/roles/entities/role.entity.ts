import { EntityHelper } from '@/utils/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'role',
})
export class RoleEntity extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;
}
