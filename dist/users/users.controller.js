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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const files_service_1 = require("../files/files.service");
const users_service_1 = require("./users.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const create_user_location_dto_1 = require("./dto/create-user-location.dto");
const update_user_location_dto_1 = require("./dto/update-user-location.dto");
const multer_1 = require("multer");
const path_1 = require("path");
let UsersController = class UsersController {
    usersService;
    filesService;
    constructor(usersService, filesService) {
        this.usersService = usersService;
        this.filesService = filesService;
    }
    async findAll() {
        return this.usersService.findAll();
    }
    async getProfile(req) {
        return this.usersService.getProfile(req.user.userId);
    }
    async findOne(id) {
        return this.usersService.findById(Number(id));
    }
    async create(createUserDto, file) {
        const data = { ...createUserDto };
        if (file) {
            const options = {
                maxSize: 5 * 1024 * 1024,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
            };
            const fileResult = await this.filesService.handleUploadedFile(file, options);
            data.image = fileResult.url;
        }
        else {
            data.image = '';
        }
        return this.usersService.create(data);
    }
    async update(id, data, req, file) {
        if (req.user.userId !== Number(id) && req.user.role !== 'ADMIN') {
            return { error: 'Unauthorized' };
        }
        const updateData = { ...data };
        if (file) {
            const options = {
                maxSize: 5 * 1024 * 1024,
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif']
            };
            const fileResult = await this.filesService.handleUploadedFile(file, options);
            updateData.image = fileResult.url;
        }
        return this.usersService.update(Number(id), updateData);
    }
    async remove(id, req) {
        if (req.user.userId !== Number(id) && req.user.role !== 'ADMIN') {
            return { error: 'Unauthorized' };
        }
        return this.usersService.remove(Number(id));
    }
    async getUserLocations(req) {
        return this.usersService.getUserLocations(req.user.userId);
    }
    async createUserLocation(createLocationDto, req) {
        return this.usersService.createUserLocation(req.user.userId, createLocationDto);
    }
    async updateUserLocation(id, updateLocationDto, req) {
        return this.usersService.updateUserLocation(req.user.userId, Number(id), updateLocationDto);
    }
    async deleteUserLocation(id, req) {
        return this.usersService.deleteUserLocation(req.user.userId, Number(id));
    }
    async setDefaultLocation(id, req) {
        return this.usersService.setDefaultLocation(req.user.userId, Number(id));
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/images/users',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `user-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/images/users',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                cb(null, `user-${uniqueSuffix}${ext}`);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('locations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserLocations", null);
__decorate([
    (0, common_1.Post)('locations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_location_dto_1.CreateUserLocationDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUserLocation", null);
__decorate([
    (0, common_1.Put)('locations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_location_dto_1.UpdateUserLocationDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserLocation", null);
__decorate([
    (0, common_1.Delete)('locations/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUserLocation", null);
__decorate([
    (0, common_1.Put)('locations/:id/set-default'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setDefaultLocation", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        files_service_1.FilesService])
], UsersController);
//# sourceMappingURL=users.controller.js.map