import { FilesService } from '../files/files.service';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    private readonly filesService;
    constructor(categoriesService: CategoriesService, filesService: FilesService);
    findAll(): Promise<{
        image: string;
        state: string;
        id: number;
        titleAr: string;
        titleEn: string;
    }[]>;
    findOne(id: string): Promise<{
        image: string;
        state: string;
        id: number;
        titleAr: string;
        titleEn: string;
    } | null>;
    create(data: CreateCategoryDto, file: Express.Multer.File): Promise<{
        image: string;
        state: string;
        id: number;
        titleAr: string;
        titleEn: string;
    }>;
    update(id: string, data: UpdateCategoryDto): Promise<{
        image: string;
        state: string;
        id: number;
        titleAr: string;
        titleEn: string;
    }>;
    remove(id: string): Promise<{
        image: string;
        state: string;
        id: number;
        titleAr: string;
        titleEn: string;
    }>;
}
