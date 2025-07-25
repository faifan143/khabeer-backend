import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: {
        id: number;
        email: string;
        role: string;
    }): Promise<{
        access_token: string;
    }>;
    register(data: RegisterDto): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        role: string;
        image: string;
        address: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
    }>;
}
