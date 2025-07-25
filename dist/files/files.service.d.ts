import { ConfigService } from '@nestjs/config';
export declare class FilesService {
    private readonly configService;
    private readonly uploadBaseUrl;
    private readonly uploadDir;
    constructor(configService: ConfigService);
    getPublicUrl(filename: string): string;
    handleUploadedFile(file: Express.Multer.File): Promise<string>;
}
