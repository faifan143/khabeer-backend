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
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        role: string;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        role: string;
    }>;
    create(createUserDto: CreateUserDto, file: Express.Multer.File): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        role: string;
    }>;
    update(id: string, data: UpdateUserDto, req: any): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string;
        role: string;
    } | {
        error: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    } | {
        error: string;
    }>;
}
