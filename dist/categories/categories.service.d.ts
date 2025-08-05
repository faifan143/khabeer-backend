import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        image: string;
        state: string;
        titleAr: string;
        titleEn: string;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        image: string;
        state: string;
        titleAr: string;
        titleEn: string;
    } | null>;
    create(data: CreateCategoryDto & {
        image: string;
    }): Promise<{
        id: number;
        image: string;
        state: string;
        titleAr: string;
        titleEn: string;
    }>;
    update(id: number, data: UpdateCategoryDto & {
        image?: string;
    }): Promise<{
        id: number;
        image: string;
        state: string;
        titleAr: string;
        titleEn: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        image: string;
        state: string;
        titleAr: string;
        titleEn: string;
    }>;
}
