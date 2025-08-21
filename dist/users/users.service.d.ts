import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
    } | null>;
    findByPhone(phone: string): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
    } | null>;
    create(data: CreateUserDto): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
    }>;
    update(id: number, data: UpdateUserDto): Promise<{
        id: number;
        name: string;
        image: string;
        state: string;
        phone: string;
        isActive: boolean;
        officialDocuments: string | null;
        createdAt: Date;
        email: string | null;
        updatedAt: Date;
        password: string;
        fcm: string | null;
        address: string;
        role: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getProfile(userId: number): Promise<{
        user: {
            id: number;
            name: string;
            image: string;
            state: string;
            phone: string;
            isActive: boolean;
            officialDocuments: string | null;
            createdAt: Date;
            email: string | null;
            updatedAt: Date;
            address: string;
            role: string;
        };
        systemInfo: {
            socialMedia: {};
            legalDocuments: Record<string, string>;
            support: Record<string, string>;
        };
    }>;
    updateFCMToken(userId: number, fcmToken: string): Promise<any>;
    removeFCMToken(userId: number): Promise<any>;
}
