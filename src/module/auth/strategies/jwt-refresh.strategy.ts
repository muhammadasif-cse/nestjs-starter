import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtRefreshPayloadType } from '@/module/auth/strategies/types/jwt-refresh-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET ?? '',
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
