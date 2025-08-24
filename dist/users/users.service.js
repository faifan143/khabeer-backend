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
            const user = await this.prisma.user.delete({ where: { id } });
            return user;
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
    async testDatabaseConnection() {
        try {
            console.log('Testing Prisma connection...');
            await this.prisma.$queryRaw `SELECT 1`;
            console.log('Database connection successful');
            return true;
        }
        catch (error) {
            console.error('Database connection failed:', error);
            throw error;
        }
    }
    async getDatabaseStats() {
        try {
            console.log('Getting database statistics...');
            const userCount = await this.prisma.user.count();
            const locationCount = await this.prisma.userLocation.count();
            const providerCount = await this.prisma.provider.count();
            console.log('User count:', userCount);
            console.log('Location count:', locationCount);
            console.log('Provider count:', providerCount);
            return {
                userCount,
                locationCount,
                providerCount
            };
        }
        catch (error) {
            console.error('Error getting database stats:', error);
            throw error;
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
            let socialMedia = {
                whatsapp: null,
                instagram: null,
                facebook: null,
                tiktok: null,
                snapchat: null,
            };
            if (groupedSettings.social?.social_links) {
                try {
                    const parsedSocialLinks = JSON.parse(groupedSettings.social.social_links);
                    console.log('Parsed social media links:', parsedSocialLinks);
                    socialMedia = {
                        whatsapp: parsedSocialLinks.whatsapp || null,
                        instagram: parsedSocialLinks.instagram || null,
                        facebook: parsedSocialLinks.facebook || null,
                        tiktok: parsedSocialLinks.tiktok || null,
                        snapchat: parsedSocialLinks.snapchat || null,
                    };
                }
                catch (parseError) {
                    console.error('Failed to parse social media links:', parseError);
                    console.error('Raw social_links value:', groupedSettings.social.social_links);
                }
            }
            else {
                console.log('No social_links found in social settings:', groupedSettings.social);
            }
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
    async getUserLocations(userId) {
        console.log('=== getUserLocations Service Method DEBUG START ===');
        console.log('Received userId parameter:', userId);
        console.log('Type of userId:', typeof userId);
        console.log('userId is valid number?', !isNaN(userId) && userId > 0);
        try {
            console.log('Checking if user exists in database...');
            const userExists = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, phone: true, role: true }
            });
            console.log('User lookup result:', userExists);
            if (!userExists) {
                console.error('ERROR: User not found in database with ID:', userId);
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            console.log('User found, now querying locations...');
            console.log('Executing Prisma query for user locations...');
            const locations = await this.prisma.userLocation.findMany({
                where: { userId },
                orderBy: [
                    { isDefault: 'desc' },
                    { createdAt: 'desc' }
                ]
            });
            console.log('Raw locations from database:', locations);
            console.log('Number of locations found:', locations.length);
            const mappedLocations = locations.map(location => ({
                id: location.id,
                title: location.title,
                description: location.description,
                latitude: Number(location.latitude),
                longitude: Number(location.longitude),
                address: location.address,
                isDefault: location.isDefault,
                createdAt: location.createdAt,
                updatedAt: location.updatedAt
            }));
            console.log('Mapped locations result:', mappedLocations);
            console.log('=== getUserLocations Service Method DEBUG END ===');
            return mappedLocations;
        }
        catch (error) {
            console.error('ERROR in getUserLocations service method:', error);
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            if (error instanceof common_1.NotFoundException) {
                console.error('This is a NotFoundException - rethrowing');
                throw error;
            }
            console.error('=== getUserLocations Service Method DEBUG END WITH ERROR ===');
            throw new common_1.InternalServerErrorException(`Error fetching user locations: ${error.message}`);
        }
    }
    async createUserLocation(userId, createLocationDto) {
        try {
            if (createLocationDto.isDefault) {
                await this.prisma.userLocation.updateMany({
                    where: { userId },
                    data: { isDefault: false }
                });
            }
            const location = await this.prisma.userLocation.create({
                data: {
                    userId,
                    title: createLocationDto.title,
                    description: createLocationDto.description,
                    latitude: createLocationDto.latitude,
                    longitude: createLocationDto.longitude,
                    address: createLocationDto.address,
                    isDefault: createLocationDto.isDefault || false
                }
            });
            return {
                id: location.id,
                title: location.title,
                description: location.description,
                latitude: Number(location.latitude),
                longitude: Number(location.longitude),
                address: location.address,
                isDefault: location.isDefault,
                createdAt: location.createdAt,
                updatedAt: location.updatedAt
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error creating user location');
        }
    }
    async updateUserLocation(userId, locationId, updateLocationDto) {
        try {
            const existingLocation = await this.prisma.userLocation.findFirst({
                where: { id: locationId, userId }
            });
            if (!existingLocation) {
                throw new common_1.NotFoundException('Location not found or access denied');
            }
            if (updateLocationDto.isDefault) {
                await this.prisma.userLocation.updateMany({
                    where: { userId },
                    data: { isDefault: false }
                });
            }
            const updatedLocation = await this.prisma.userLocation.update({
                where: { id: locationId },
                data: updateLocationDto
            });
            return {
                id: updatedLocation.id,
                title: updatedLocation.title,
                description: updatedLocation.description,
                latitude: Number(updatedLocation.latitude),
                longitude: Number(updatedLocation.longitude),
                address: updatedLocation.address,
                isDefault: updatedLocation.isDefault,
                createdAt: updatedLocation.createdAt,
                updatedAt: updatedLocation.updatedAt
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error updating user location');
        }
    }
    async deleteUserLocation(userId, locationId) {
        try {
            const existingLocation = await this.prisma.userLocation.findFirst({
                where: { id: locationId, userId }
            });
            if (!existingLocation) {
                throw new common_1.NotFoundException('Location not found or access denied');
            }
            if (existingLocation.isDefault) {
                const otherLocation = await this.prisma.userLocation.findFirst({
                    where: { userId, id: { not: locationId } },
                    orderBy: { createdAt: 'desc' }
                });
                if (otherLocation) {
                    await this.prisma.userLocation.update({
                        where: { id: otherLocation.id },
                        data: { isDefault: true }
                    });
                }
            }
            await this.prisma.userLocation.delete({
                where: { id: locationId }
            });
            return { message: 'Location deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error deleting user location');
        }
    }
    async setDefaultLocation(userId, locationId) {
        try {
            const existingLocation = await this.prisma.userLocation.findFirst({
                where: { id: locationId, userId }
            });
            if (!existingLocation) {
                throw new common_1.NotFoundException('Location not found or access denied');
            }
            await this.prisma.userLocation.updateMany({
                where: { userId },
                data: { isDefault: false }
            });
            const updatedLocation = await this.prisma.userLocation.update({
                where: { id: locationId },
                data: { isDefault: true }
            });
            return {
                id: updatedLocation.id,
                title: updatedLocation.title,
                description: updatedLocation.description,
                latitude: Number(updatedLocation.latitude),
                longitude: Number(updatedLocation.longitude),
                address: updatedLocation.address,
                isDefault: updatedLocation.isDefault,
                createdAt: updatedLocation.createdAt,
                updatedAt: updatedLocation.updatedAt
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error setting default location');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map