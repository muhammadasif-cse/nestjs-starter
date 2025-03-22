import { StatusEntity } from '@/module/status/entities/status.entity';
import { StatusEnum } from '@/module/status/enum/status.enum';

export const StatusSeed: Partial<StatusEntity>[] = [
  { id: StatusEnum.active, name: 'active', description: 'Active status' },
  { id: StatusEnum.inactive, name: 'inactive', description: 'Inactive status' },
  { id: StatusEnum.pending, name: 'pending', description: 'Pending status' },
  { id: StatusEnum.banned, name: 'banned', description: 'Banned status' },
];
