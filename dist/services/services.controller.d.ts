import { FilesService } from '../files/files.service';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesController {
    private readonly servicesService;
    private readonly filesService;
    constructor(servicesService: ServicesService, filesService: FilesService);
    findAll(): Promise<{
        id: number;
        image: string;
        title: string;
        description: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        image: string;
        title: string;
        description: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    } | null>;
    create(data: CreateServiceDto, file: Express.Multer.File): Promise<{
        id: number;
        image: string;
        title: string;
        description: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    update(id: string, data: UpdateServiceDto): Promise<{
        id: number;
        image: string;
        title: string;
        description: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        image: string;
        title: string;
        description: string;
        commission: number;
        whatsapp: string;
        categoryId: number | null;
    }>;
}
