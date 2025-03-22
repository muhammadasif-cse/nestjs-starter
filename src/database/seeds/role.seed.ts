import { RoleEntity } from '@/module/role/entities/role.entity';
import { RoleEnum } from '@/module/role/enum/role.enum';

export const RoleSeed: Partial<RoleEntity>[] = [
  { id: RoleEnum.admin, name: 'admin', description: 'Administrator role' },
  { id: RoleEnum.manager, name: 'manager', description: 'Manager role' },
  { id: RoleEnum.staff, name: 'staff', description: 'Staff role' },
  { id: RoleEnum.user, name: 'user', description: 'Regular user role' },
];
