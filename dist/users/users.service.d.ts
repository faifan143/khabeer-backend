import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
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
    } | null>;
    create(data: CreateUserDto): Promise<{
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
    }[]>;
    findById(id: number): Promise<{
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
    } | null>;
    update(id: number, data: UpdateUserDto): Promise<{
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
    remove(id: number): Promise<{
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
