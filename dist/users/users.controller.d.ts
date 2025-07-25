import { FilesService } from '../files/files.service';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    private readonly filesService;
    constructor(usersService: UsersService, filesService: FilesService);
    findAll(): Promise<{
        name: string;
        email: string;
        password: string;
        image: string;
        address: string;
        phone: string;
        state: string;
        role: string;
        isActive: boolean;
        officialDocuments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        email: string;
        password: string;
        image: string;
        address: string;
        phone: string;
        state: string;
        role: string;
        isActive: boolean;
        officialDocuments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: CreateUserDto, file: Express.Multer.File): Promise<{
        name: string;
        email: string;
        password: string;
        image: string;
        address: string;
        phone: string;
        state: string;
        role: string;
        isActive: boolean;
        officialDocuments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: UpdateUserDto, req: any): Promise<{
        name: string;
        email: string;
        password: string;
        image: string;
        address: string;
        phone: string;
        state: string;
        role: string;
        isActive: boolean;
        officialDocuments: string | null;
        id: number;
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
