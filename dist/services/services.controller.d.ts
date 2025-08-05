import { FilesService } from '../files/files.service';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesController {
    private readonly servicesService;
    private readonly filesService;
    constructor(servicesService: ServicesService, filesService: FilesService);
    findAll(): Promise<{
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }[]>;
    findByCategory(categoryId: string): Promise<({
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
    findOne(id: string): Promise<{
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    } | null>;
    create(createServiceDto: CreateServiceDto, file: Express.Multer.File): Promise<{
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    update(id: string, data: UpdateServiceDto, file: Express.Multer.File): Promise<{
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    remove(id: string): Promise<{
        description: string;
        id: number;
        image: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
}
