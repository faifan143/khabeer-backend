import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }[]>;
    findByCategory(categoryId: number): Promise<({
        category: {
            image: string;
            state: string;
            id: number;
            titleAr: string;
            titleEn: string;
        } | null;
    } & {
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    })[]>;
    findById(id: number): Promise<{
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    } | null>;
    create(data: CreateServiceDto): Promise<{
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    update(id: number, data: UpdateServiceDto): Promise<{
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    remove(id: number): Promise<{
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
}
