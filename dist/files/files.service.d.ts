import { ConfigService } from '@nestjs/config';
export interface FileUploadResult {
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimetype: string;
}
export interface FileValidationOptions {
    maxSize?: number;
    allowedMimeTypes?: string[];
    allowedExtensions?: string[];
}
export declare class FilesService {
    private readonly configService;
    private readonly uploadBaseUrl;
    private readonly uploadDir;
    private readonly maxFileSize;
    private readonly allowedMimeTypes;
    private readonly allowedExtensions;
    constructor(configService: ConfigService);
    private ensureUploadDirectory;
    getPublicUrl(filename: string): string;
    handleUploadedFile(file: Express.Multer.File, options?: FileValidationOptions): Promise<FileUploadResult>;
    handleMultipleFiles(files: Express.Multer.File[], options?: FileValidationOptions): Promise<FileUploadResult[]>;
    private validateFile;
    deleteFile(filename: string): Promise<void>;
    deleteMultipleFiles(filenames: string[]): Promise<void>;
    private getFileExtension;
    private formatBytes;
    getFileInfo(filename: string): Promise<FileUploadResult | null>;
    private getMimeTypeFromExtension;
    createUploadDirectory(category: string): Promise<string>;
    uploadToCategory(file: Express.Multer.File, category: string, options?: FileValidationOptions): Promise<FileUploadResult>;
    getUploadStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        categories: {
            [key: string]: number;
        };
    }>;
}
