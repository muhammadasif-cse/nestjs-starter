import { Session } from '@/module/session/entities/session.entity';
import { UserEntity } from '@/module/user/entities/user.entity';

export type JwtPayloadType = Pick<UserEntity, 'id' | 'role'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
