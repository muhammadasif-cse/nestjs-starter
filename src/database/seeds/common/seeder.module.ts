import { RoleEntity } from '@/module/role/entities/role.entity';
import { StatusEntity } from '@/module/status/entities/status.entity';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, StatusEntity])],
  providers: [SeederService],
})
export class SeederModule implements OnApplicationBootstrap {
  constructor(private readonly seederService: SeederService) {}

  async onApplicationBootstrap() {
    await this.seederService.seedAll();
  }
}
