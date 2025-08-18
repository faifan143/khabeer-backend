import { FilesService } from '../files/files.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly filesService;
    constructor(usersService: UsersService, filesService: FilesService);
    findAll(): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getProfile(req: any): Promise<{
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            image: string;
            address: string;
            phone: string;
            state: string;
            isActive: boolean;
            officialDocuments: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        systemInfo: {
            socialMedia: {};
            legalDocuments: Record<string, string>;
            support: Record<string, string>;
        };
    }>;
    findOne(id: string): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(createUserDto: CreateUserDto, file: Express.Multer.File): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: UpdateUserDto, req: any, file: Express.Multer.File): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
    } | {
        error: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    } | {
        error: string;
    }>;
}
