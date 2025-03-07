import { NullableType } from '@/utils/types/nullable.type';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { User } from '../domain/user';
import { SortUserDto } from '../dto/query-user.dto';
import { UserEntity } from '../entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<User> {
    const entity = this.userRepository.create(
      UserMapper.toPersistence(data as User),
    );
    const savedEntity = await this.userRepository.save(entity);
    return UserMapper.toDomain(savedEntity);
  }

  async findAllWithPagination({
    where,
    sort,
    page,
    limit,
  }: {
    where?: FindOptionsWhere<UserEntity>;
    sort?: SortUserDto[];
    page: number;
    limit: number;
  }): Promise<{ users: User[]; total: number }> {
    const [entities, total] = await this.userRepository.findAndCount({
      where,
      relations: ['role', 'status'],
      order: sort?.reduce((acc, s) => ({ ...acc, [s.orderBy]: s.order }), {}),
      skip: (page - 1) * limit,
      take: limit,
    });

    return { users: entities.map(UserMapper.toDomain), total };
  }

  async findById(id: string): Promise<NullableType<User>> {
    const entity = await this.userRepository.findOne({ where: { id } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const entities = await this.userRepository.find({ where: { id: In(ids) } });
    return entities.map(UserMapper.toDomain);
  }

  async findByEmail(email: string): Promise<NullableType<User>> {
    const entity = await this.userRepository.findOne({ where: { email } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: string | null;
    provider: string;
  }): Promise<NullableType<User>> {
    const entity = await this.userRepository.findOne({
      where: { socialId: socialId ?? undefined, provider },
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async update(id: string, payload: Partial<User>): Promise<User> {
    const entity = await this.userRepository.preload({
      ...UserMapper.toPersistence(payload as User),
      id,
    });
    if (!entity) throw new Error('User not found');
    const updatedEntity = await this.userRepository.save(entity);
    return UserMapper.toDomain(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }
}
