import { FileMapper } from '@/files/infrastructure/persistence/mappers/file.mapper';
import { RoleEntity } from '@/roles/entities/role.entity';
import { StatusEntity } from '@/statuses/entities/status.entity';
import { User } from '../domain/user';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    const domain = new User();
    domain.id = entity.id;
    domain.email = entity.email;
    domain.password = entity.password;
    domain.provider = entity.provider;
    domain.socialId = entity.socialId;
    domain.firstName = entity.firstName;
    domain.lastName = entity.lastName;
    domain.photo = entity.photo ? FileMapper.toDomain(entity.photo) : null;
    domain.role = entity.role ? ({ id: entity.role.id } as any) : undefined;
    domain.status = entity.status
      ? ({ id: entity.status.id } as any)
      : undefined;
    domain.createdAt = entity.createdAt;
    domain.updatedAt = entity.updatedAt;
    domain.deletedAt = entity.deletedAt;
    return domain;
  }

  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.id;
    entity.email = domain.email;
    entity.password = domain.password;
    entity.provider = domain.provider;
    entity.socialId = domain.socialId;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.photo = domain.photo ? FileMapper.toPersistence(domain.photo) : null;
    entity.role = domain.role
      ? Object.assign(new RoleEntity(), { id: domain.role.id })
      : null;
    entity.status = domain.status
      ? Object.assign(new StatusEntity(), { id: domain.status.id })
      : null;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt ?? null;
    return entity;
  }
}
