import { Strategy } from 'passport-jwt';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayloadDto): Promise<{
        userId: number;
        email: string;
        role: string;
    }>;
}
export {};
