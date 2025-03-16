// import { User } from '@/modules/users/domain/user';
// import { Session } from '@/session/domain/session';

export type JwtPayloadType = Pick<any, 'id' | 'role'> & {
  sessionId: any['id'];
  iat: number;
  exp: number;
};
// import { User } from '@/modules/users/domain/user';
// import { Session } from '@/session/domain/session';
//
// export type JwtPayloadType = Pick<User, 'id' | 'role'> & {
//   sessionId: Session['id'];
//   iat: number;
//   exp: number;
// };
