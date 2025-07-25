import { FilesService } from '../files/files.service';
import { ProvidersService } from './providers.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
export declare class ProvidersController {
    private readonly providersService;
    private readonly filesService;
    constructor(providersService: ProvidersService, filesService: FilesService);
    findAll(): Promise<{
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        description: string;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        description: string;
    } | null>;
    register(data: CreateProviderDto, file: Express.Multer.File): Promise<{
        providerServices: {
            id: number;
            serviceId: number;
            providerId: number;
        }[];
    } & {
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        description: string;
    }>;
    create(data: CreateProviderDto): Promise<{
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        description: string;
    }>;
    update(id: string, data: UpdateProviderDto): Promise<{
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        description: string;
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        description: string;
    }>;
}
