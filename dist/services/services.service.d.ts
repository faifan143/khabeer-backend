import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        image: string;
        title: string;
        description: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        image: string;
        title: string;
        description: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    } | null>;
    create(data: CreateServiceDto): Promise<{
        id: number;
        image: string;
        title: string;
        description: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    update(id: number, data: UpdateServiceDto): Promise<{
        id: number;
        image: string;
        title: string;
        description: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        image: string;
        title: string;
        description: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
}
