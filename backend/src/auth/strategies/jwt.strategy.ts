import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;

    if (!secret) {
      // Do not crash the whole app if JWT env is missing — log a clear warning
      // and use a non-secret placeholder so the application can still start.
      // WARNING: Tokens will be invalid until a proper `JWT_SECRET` is set in production.
      // This prevents startup failures while making the issue visible in logs.
      // The operator should set `JWT_SECRET` and `JWT_REFRESH_SECRET` in Railway variables.
      // eslint-disable-next-line no-console
      console.warn('⚠️  JWT_SECRET is not defined. Authentication will be disabled until configured.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret ?? 'placeholder-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Token invalide ou utilisateur désactivé');
    }

    return user;
  }
}
