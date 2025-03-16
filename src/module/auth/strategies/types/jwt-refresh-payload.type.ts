// import { Session } from '../../../session/domain/session';

export type JwtRefreshPayloadType = {
  sessionId: any['id'];
  hash: any['hash'];
  iat: number;
  exp: number;
};
// export type JwtRefreshPayloadType = {
//   sessionId: Session['id'];
//   hash: Session['hash'];
//   iat: number;
//   exp: number;
// };
