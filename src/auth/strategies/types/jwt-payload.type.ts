import { User } from 'src/modules/users/domain/user';
import { Session } from 'src/session/domain/session';

export type JwtPayloadType = Pick<User, 'id' | 'role'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
