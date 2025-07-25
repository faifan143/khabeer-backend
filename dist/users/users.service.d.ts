import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
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
    } | null>;
    create(data: CreateUserDto): Promise<{
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
    findById(id: number): Promise<{
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
    update(id: number, data: UpdateUserDto): Promise<{
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
    remove(id: number): Promise<{
        message: string;
    }>;
}
