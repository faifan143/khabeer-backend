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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("./files.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const multer_1 = require("multer");
const path_1 = require("path");
let FilesController = class FilesController {
    filesService;
    constructor(filesService) {
        this.filesService = filesService;
    }
    async uploadFile(file, body) {
        const options = {};
        if (body.maxSize) {
            options.maxSize = parseInt(body.maxSize.toString());
        }
        if (body.allowedTypes) {
            options.allowedMimeTypes = body.allowedTypes.split(',');
        }
        const result = await this.filesService.handleUploadedFile(file, options);
        return result;
    }
    async uploadMultipleFiles(files, body) {
        const options = {};
        if (body.maxSize) {
            options.maxSize = parseInt(body.maxSize.toString());
        }
        if (body.allowedTypes) {
            options.allowedMimeTypes = body.allowedTypes.split(',');
        }
        const results = await this.filesService.handleMultipleFiles(files, options);
        return {
            message: `Successfully uploaded ${results.length} files`,
            files: results
        };
    }
    async uploadDocuments(files) {
        const options = {
            maxSize: 10 * 1024 * 1024,
            allowedMimeTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png'
            ],
            allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
        };
        const results = await this.filesService.handleMultipleFiles(files, options);
        return {
            message: `Successfully uploaded ${results.length} documents`,
            documents: results
        };
    }
    async uploadImages(files) {
        const options = {
            maxSize: 5 * 1024 * 1024,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
            allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
        };
        const results = await this.filesService.handleMultipleFiles(files, options);
        return {
            message: `Successfully uploaded ${results.length} images`,
            images: results
        };
    }
    async deleteFile(filename) {
        await this.filesService.deleteFile(filename);
        return { message: 'File deleted successfully' };
    }
    async deleteMultipleFiles(body) {
        await this.filesService.deleteMultipleFiles(body.filenames);
        return { message: `${body.filenames.length} files deleted successfully` };
    }
    async getFileInfo(filename) {
        const fileInfo = await this.filesService.getFileInfo(filename);
        if (!fileInfo) {
            return { message: 'File not found' };
        }
        return fileInfo;
    }
    async getUploadStats() {
        return this.filesService.getUploadStats();
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Post)('upload-documents'),
    (0, roles_decorator_1.Roles)('PROVIDER'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('documents', 5, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/documents',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `doc-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadDocuments", null);
__decorate([
    (0, common_1.Post)('upload-images'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/images',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `img-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadImages", null);
__decorate([
    (0, common_1.Delete)(':filename'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Delete)('delete-multiple'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteMultipleFiles", null);
__decorate([
    (0, common_1.Get)('info/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFileInfo", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getUploadStats", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map