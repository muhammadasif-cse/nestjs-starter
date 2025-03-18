import { SessionEntity } from '@/module/session/entities/session.entity';

export type JwtRefreshPayloadType = {
  sessionId: SessionEntity['id'];
  hash: SessionEntity['hash'];
  iat: number;
  exp: number;
};
