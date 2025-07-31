import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }[]>;
    findByCategory(categoryId: number): Promise<({
        category: {
            id: number;
            image: string;
            state: string;
            titleAr: string;
            titleEn: string;
        } | null;
    } & {
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    })[]>;
    findById(id: number): Promise<{
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    } | null>;
    create(data: CreateServiceDto): Promise<{
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    update(id: number, data: UpdateServiceDto): Promise<{
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    remove(id: number): Promise<{
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
}
