import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        image: string;
        state: string;
        id: number;
        titleAr: string;
        titleEn: string;
    }[]>;
    findById(id: number): Promise<{
        image: string;
        state: string;
        id: number;
        titleAr: string;
        titleEn: string;
    } | null>;
    create(data: CreateCategoryDto): Promise<{
        image: string;
        state: string;
        id: number;
        titleAr: string;
        titleEn: string;
    }>;
    update(id: number, data: UpdateCategoryDto): Promise<{
        image: string;
        state: string;
        id: number;
        titleAr: string;
        titleEn: string;
    }>;
    remove(id: number): Promise<{
        image: string;
        state: string;
        id: number;
        titleAr: string;
        titleEn: string;
    }>;
}
