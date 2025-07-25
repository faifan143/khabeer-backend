import { FilesService } from '../files/files.service';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesController {
    private readonly servicesService;
    private readonly filesService;
    constructor(servicesService: ServicesService, filesService: FilesService);
    findAll(): Promise<{
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }[]>;
    findByCategory(categoryId: string): Promise<({
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
    findOne(id: string): Promise<{
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    } | null>;
    create(data: CreateServiceDto, file: Express.Multer.File): Promise<{
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    update(id: string, data: UpdateServiceDto): Promise<{
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    remove(id: string): Promise<{
        image: string;
        id: number;
        description: string;
        title: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
}
