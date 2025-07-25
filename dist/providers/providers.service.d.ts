import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
export declare class ProvidersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    findById(id: number): Promise<{
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        description: string;
    } | null>;
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
    registerProviderWithServices(data: CreateProviderDto): Promise<{
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
    update(id: number, data: UpdateProviderDto): Promise<{
        id: number;
        name: string;
        image: string;
        phone: string;
        state: string;
        isActive: boolean;
        officialDocuments: string | null;
        description: string;
    }>;
    remove(id: number): Promise<{
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
