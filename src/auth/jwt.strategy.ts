import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
    });
  }

  async validate(payload: JwtPayloadDto) {
    console.log('=== JWT Strategy Validate DEBUG START ===');
    console.log('Raw JWT payload received:', payload);
    console.log('Payload sub (userId):', payload.sub);
    console.log('Payload username:', payload.username);
    console.log('Payload role:', payload.role);
    console.log('Type of payload.sub:', typeof payload.sub);
    console.log('payload.sub is valid number?', !isNaN(payload.sub) && payload.sub > 0);

    const result = {
      userId: payload.sub,
      email: payload.username,
      role: payload.role
    };

    console.log('Returning user object:', result);
    console.log('=== JWT Strategy Validate DEBUG END ===');

    return result;
  }
}
