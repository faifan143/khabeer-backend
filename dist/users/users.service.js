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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        try {
            return await this.prisma.user.findUnique({ where: { email } });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error finding user by email');
        }
    }
    async findByPhone(phone) {
        try {
            return await this.prisma.user.findFirst({ where: { phone } });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error finding user by phone');
        }
    }
    async create(data) {
        try {
            const userData = {
                ...data,
                image: data.image || '',
                address: data.address || '',
                phone: data.phone || '',
                state: data.state || '',
                isActive: data.isActive ?? true
            };
            return await this.prisma.user.create({ data: userData });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
                            throw new common_1.BadRequestException('User with this email already exists');
                        }
                        break;
                    case 'P2003':
                        throw new common_1.BadRequestException('Invalid reference data provided');
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error creating user');
        }
    }
    async findAll() {
        try {
            return await this.prisma.user.findMany();
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error fetching users');
        }
    }
    async findById(id) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id } });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${id} not found`);
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error finding user');
        }
    }
    async update(id, data) {
        try {
            const user = await this.prisma.user.update({ where: { id }, data });
            return user;
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        throw new common_1.NotFoundException(`User with ID ${id} not found`);
                    case 'P2002':
                        if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
                            throw new common_1.BadRequestException('User with this email already exists');
                        }
                        break;
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error updating user');
        }
    }
    async remove(id) {
        try {
            await this.prisma.user.delete({ where: { id } });
            return { message: 'User deleted successfully' };
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        throw new common_1.NotFoundException(`User with ID ${id} not found`);
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error deleting user');
        }
    }
    async getProfile(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    image: true,
                    address: true,
                    phone: true,
                    state: true,
                    isActive: true,
                    officialDocuments: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            const systemSettings = await this.prisma.systemSettings.findMany({
                where: {
                    category: {
                        in: ['social', 'legal', 'support']
                    }
                }
            });
            const groupedSettings = systemSettings.reduce((acc, setting) => {
                if (!acc[setting.category]) {
                    acc[setting.category] = {};
                }
                acc[setting.category][setting.key] = setting.value;
                return acc;
            }, {});
            const socialMedia = {
                whatsapp: groupedSettings.social?.whatsapp || null,
                instagram: groupedSettings.social?.instagram || null,
                facebook: groupedSettings.social?.facebook || null,
                tiktok: groupedSettings.social?.tiktok || null,
                snapchat: groupedSettings.social?.snapchat || null,
            };
            const legalDocuments = {
                terms_en: groupedSettings.legal?.terms_en || null,
                terms_ar: groupedSettings.legal?.terms_ar || null,
                privacy_en: groupedSettings.legal?.privacy_en || null,
                privacy_ar: groupedSettings.legal?.privacy_ar || null,
            };
            const support = {
                whatsapp_support: groupedSettings.support?.whatsapp_support || null,
            };
            return {
                user,
                systemInfo: {
                    socialMedia,
                    legalDocuments,
                    support
                }
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error fetching user profile');
        }
    }
    async updateFCMToken(userId, fcmToken) {
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: { fcm: fcmToken },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    fcm: true,
                    updatedAt: true
                }
            });
            return updatedUser;
        }
        catch (error) {
            throw new Error(`Failed to update FCM token for user ${userId}: ${error.message}`);
        }
    }
    async removeFCMToken(userId) {
        try {
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: { fcm: null },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    fcm: true,
                    updatedAt: true
                }
            });
            return updatedUser;
        }
        catch (error) {
            throw new Error(`Failed to remove FCM token for user ${userId}: ${error.message}`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map