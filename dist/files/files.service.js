"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const fs_1 = require("fs");
let FilesService = class FilesService {
    configService;
    uploadBaseUrl;
    uploadDir;
    maxFileSize;
    allowedMimeTypes;
    allowedExtensions;
    constructor(configService) {
        this.configService = configService;
        this.uploadBaseUrl = '/uploads/';
        this.uploadDir = (0, path_1.join)(process.cwd(), 'uploads');
        this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 5 * 1024 * 1024);
        this.allowedMimeTypes = this.configService.get('ALLOWED_MIME_TYPES', 'image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document').split(',');
        this.allowedExtensions = this.configService.get('ALLOWED_EXTENSIONS', '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx').split(',');
        this.ensureUploadDirectory();
    }
    ensureUploadDirectory() {
        if (!(0, fs_1.existsSync)(this.uploadDir)) {
            (0, fs_1.mkdirSync)(this.uploadDir, { recursive: true });
        }
        const documentsDir = (0, path_1.join)(this.uploadDir, 'documents');
        const imagesDir = (0, path_1.join)(this.uploadDir, 'images');
        if (!(0, fs_1.existsSync)(documentsDir)) {
            (0, fs_1.mkdirSync)(documentsDir, { recursive: true });
        }
        if (!(0, fs_1.existsSync)(imagesDir)) {
            (0, fs_1.mkdirSync)(imagesDir, { recursive: true });
        }
    }
    getPublicUrl(filename) {
        return this.uploadBaseUrl + filename;
    }
    async handleUploadedFile(file, options) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        this.validateFile(file, options);
        const result = {
            filename: file.filename,
            originalName: file.originalname,
            url: this.getPublicUrl(file.filename),
            size: file.size,
            mimetype: file.mimetype
        };
        return result;
    }
    async handleMultipleFiles(files, options) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided');
        }
        const results = [];
        for (const file of files) {
            try {
                const result = await this.handleUploadedFile(file, options);
                results.push(result);
            }
            catch (error) {
                for (const uploadedFile of results) {
                    this.deleteFile(uploadedFile.filename);
                }
                throw error;
            }
        }
        return results;
    }
    validateFile(file, options) {
        const maxSize = options?.maxSize || this.maxFileSize;
        const allowedMimeTypes = options?.allowedMimeTypes || this.allowedMimeTypes;
        const allowedExtensions = options?.allowedExtensions || this.allowedExtensions;
        if (file.size > maxSize) {
            this.deleteFile(file.filename);
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${this.formatBytes(maxSize)}`);
        }
        if (!allowedMimeTypes.includes(file.mimetype)) {
            this.deleteFile(file.filename);
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
        const fileExtension = this.getFileExtension(file.originalname);
        if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
            this.deleteFile(file.filename);
            throw new common_1.BadRequestException(`File extension ${fileExtension} is not allowed`);
        }
    }
    async deleteFile(filename) {
        const filePath = (0, path_1.join)(this.uploadDir, filename);
        if ((0, fs_1.existsSync)(filePath)) {
            try {
                (0, fs_1.unlinkSync)(filePath);
            }
            catch (error) {
                console.error(`Error deleting file ${filename}:`, error);
            }
        }
    }
    async deleteMultipleFiles(filenames) {
        for (const filename of filenames) {
            await this.deleteFile(filename);
        }
    }
    getFileExtension(filename) {
        return filename.substring(filename.lastIndexOf('.'));
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    async getFileInfo(filename) {
        const filePath = (0, path_1.join)(this.uploadDir, filename);
        if (!(0, fs_1.existsSync)(filePath)) {
            return null;
        }
        return {
            filename,
            originalName: filename,
            url: this.getPublicUrl(filename),
            size: 0,
            mimetype: this.getMimeTypeFromExtension(this.getFileExtension(filename))
        };
    }
    getMimeTypeFromExtension(extension) {
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    }
    async createUploadDirectory(category) {
        const categoryDir = (0, path_1.join)(this.uploadDir, category);
        if (!(0, fs_1.existsSync)(categoryDir)) {
            (0, fs_1.mkdirSync)(categoryDir, { recursive: true });
        }
        return categoryDir;
    }
    async uploadToCategory(file, category, options) {
        await this.createUploadDirectory(category);
        return this.handleUploadedFile(file, options);
    }
    async getUploadStats() {
        return {
            totalFiles: 0,
            totalSize: 0,
            categories: {}
        };
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map