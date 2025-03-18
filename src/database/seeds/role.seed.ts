import { RoleEntity } from '@/module/role/entities/role.entity';

export const RoleSeed: Partial<RoleEntity>[] = [
  { id: 1, name: 'admin', description: 'Administrator role' },
  { id: 2, name: 'staff', description: 'Staff role' },
  { id: 3, name: 'moderator', description: 'Moderator role' },
  { id: 4, name: 'manager', description: 'Manager role' },
  { id: 5, name: 'maintainer', description: 'Maintainer role' },
  { id: 6, name: 'user', description: 'Regular user role' },
];
