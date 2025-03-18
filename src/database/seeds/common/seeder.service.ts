import { RoleEntity } from '@/module/role/entities/role.entity';
import { StatusEntity } from '@/module/status/entities/status.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RoleSeed } from '../role.seed';
import { StatusSeed } from '../status.seed';

@Injectable()
export class SeederService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async seedRoles(): Promise<void> {
    const roleRepository = this.dataSource.getRepository(RoleEntity);

    for (const role of RoleSeed) {
      const existingRole = await roleRepository.findOne({
        where: { id: role.id },
      });
      if (!existingRole) {
        await roleRepository.save(role);
      }
    }
  }

  async seedStatuses(): Promise<void> {
    const statusRepository = this.dataSource.getRepository(StatusEntity);

    for (const status of StatusSeed) {
      const existingStatus = await statusRepository.findOne({
        where: { id: status.id },
      });
      if (!existingStatus) {
        await statusRepository.save(status);
      }
    }
  }

  async seedAll(): Promise<void> {
    await this.seedRoles();
    await this.seedStatuses();
  }
}
