import { StatusEntity } from '@/module/status/entities/status.entity';

export const StatusSeed: Partial<StatusEntity>[] = [
  { id: 1, name: 'active', description: 'Active status' },
  { id: 2, name: 'inactive', description: 'Inactive status' },
  { id: 3, name: 'pending', description: 'Pending status' },
  { id: 4, name: 'banned', description: 'Banned status' },
  { id: 5, name: 'restricted', description: 'Restricted status' },
];
