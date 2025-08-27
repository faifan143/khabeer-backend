import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 🔥 CRITICAL FIX: Use ConfigService instead of process.env
      secretOrKey: configService.get('JWT_SECRET', 'supersecret'),
    });
  }

  async validate(payload: JwtPayloadDto) {
    const result = {
      userId: payload.sub,
      email: payload.username,
      role: payload.role
    };

    return result;
  }
}
