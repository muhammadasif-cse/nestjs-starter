import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionService } from '../../session/session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly sessionService: SessionService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.AUTH_JWT_SECRET || '',
    });
  }

  async validate(payload: any) {
    const { sessionId, id: userId } = payload;

    const session = await this.sessionService.findActiveSession(sessionId);
    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return { id: userId, sessionId };
  }
}
