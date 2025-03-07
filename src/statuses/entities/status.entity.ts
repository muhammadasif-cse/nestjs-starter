import { EntityRelationalHelper } from '@/utils/entity-helper';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'status',
})
export class StatusEntity extends EntityRelationalHelper {
  @PrimaryColumn()
  id: number;

  @Column()
  name?: string;
}
