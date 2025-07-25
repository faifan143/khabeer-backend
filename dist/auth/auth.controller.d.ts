import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { FilesService } from 'src/files/files.service';
export declare class AuthController {
    private readonly authService;
    private readonly filesService;
    constructor(authService: AuthService, filesService: FilesService);
    login(body: LoginDto): Promise<{
        access_token: string;
    }>;
    register(body: RegisterDto, file: Express.Multer.File): Promise<{
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
    me(req: any): Promise<any>;
}
