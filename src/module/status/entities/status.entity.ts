import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('statuses')
export class StatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;
}
