import { JwtRefreshPayloadType } from '@/module/auth/strategies/types/jwt-refresh-payload.type';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.AUTH_REFRESH_SECRET ?? '',
    });
  }

  public validate(
    payload: JwtRefreshPayloadType,
  ): JwtRefreshPayloadType | never {
    if (!payload.sessionId) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
