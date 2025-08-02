import { FilesService, FileUploadResult } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    private static ensureDirectory;
    private static getStorageConfig;
    uploadFile(file: Express.Multer.File, body: {
        category?: string;
        maxSize?: number;
        allowedTypes?: string;
    }): Promise<FileUploadResult>;
    uploadMultipleFiles(files: Express.Multer.File[], body: {
        category?: string;
        maxSize?: number;
        allowedTypes?: string;
    }): Promise<{
        message: string;
        files: FileUploadResult[];
    }>;
    uploadDocuments(files: Express.Multer.File[]): Promise<{
        message: string;
        documents: FileUploadResult[];
    }>;
    uploadImages(files: Express.Multer.File[]): Promise<{
        message: string;
        images: FileUploadResult[];
    }>;
    deleteFile(filename: string): Promise<{
        message: string;
    }>;
    deleteMultipleFiles(body: {
        filenames: string[];
    }): Promise<{
        message: string;
    }>;
    getFileInfo(filename: string): Promise<FileUploadResult | {
        message: string;
    }>;
    getUploadStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        categories: {
            [key: string]: number;
        };
    }>;
}
