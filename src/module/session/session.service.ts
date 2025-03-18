import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionEntity } from './entities/session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<SessionEntity> {
    const session = this.sessionRepository.create(createSessionDto);
    return await this.sessionRepository.save(session);
  }

  async findOne(id: string): Promise<SessionEntity | null> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<SessionEntity> {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    const updatedSession = this.sessionRepository.merge(
      session,
      updateSessionDto,
    );
    return await this.sessionRepository.save(updatedSession);
  }

  async deleteById(id: string): Promise<void> {
    const result = await this.sessionRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    const result = await this.sessionRepository.softDelete({
      user: { id: userId },
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `No sessions found for user with ID ${userId}`,
      );
    }
  }

  async deleteByUserIdWithExclude(
    userId: string,
    excludeSessionId: string,
  ): Promise<void> {
    const result = await this.sessionRepository.softDelete({
      user: { id: userId },
      id: Not(excludeSessionId),
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `No sessions found for user with ID ${userId}`,
      );
    }
  }
}
