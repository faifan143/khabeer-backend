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
exports.ProvidersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let ProvidersService = class ProvidersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        try {
            return await this.prisma.provider.findMany();
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error fetching providers');
        }
    }
    async findByEmail(email) {
        try {
            return await this.prisma.provider.findUnique({ where: { email } });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error finding provider by email');
        }
    }
    async findByPhone(phone) {
        try {
            return await this.prisma.provider.findFirst({ where: { phone } });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error finding provider by phone');
        }
    }
    async findById(id) {
        try {
            const provider = await this.prisma.provider.findUnique({ where: { id } });
            if (!provider) {
                throw new common_1.NotFoundException(`Provider with ID ${id} not found`);
            }
            return provider;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error finding provider');
        }
    }
    async create(data) {
        try {
            return await this.prisma.provider.create({ data });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
                            throw new common_1.BadRequestException('Provider with this email already exists');
                        }
                        break;
                    case 'P2003':
                        throw new common_1.BadRequestException('Invalid reference data provided');
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error creating provider');
        }
    }
    async registerProviderWithServices(data) {
        try {
            const { serviceIds, ...providerData } = data;
            return await this.prisma.provider.create({
                data: {
                    ...providerData,
                    providerServices: {
                        create: (serviceIds || []).map(serviceId => ({ serviceId }))
                    }
                },
                include: { providerServices: true }
            });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
                            throw new common_1.BadRequestException('Provider with this email already exists');
                        }
                        break;
                    case 'P2003':
                        throw new common_1.BadRequestException('Invalid service reference provided');
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error registering provider with services');
        }
    }
    async update(id, data) {
        try {
            const { serviceIds, ...providerData } = data;
            if (serviceIds !== undefined) {
                await this.prisma.providerService.deleteMany({
                    where: { providerId: id }
                });
                if (serviceIds && serviceIds.length > 0) {
                    await this.prisma.providerService.createMany({
                        data: serviceIds.map(serviceId => ({
                            providerId: id,
                            serviceId
                        }))
                    });
                }
            }
            const provider = await this.prisma.provider.update({
                where: { id },
                data: providerData,
                include: { providerServices: true }
            });
            return provider;
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        throw new common_1.NotFoundException(`Provider with ID ${id} not found`);
                    case 'P2002':
                        if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
                            throw new common_1.BadRequestException('Provider with this email already exists');
                        }
                        break;
                    case 'P2003':
                        throw new common_1.BadRequestException('Invalid service reference provided');
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error updating provider');
        }
    }
    async updateStatus(id, isActive) {
        try {
            const provider = await this.prisma.provider.update({
                where: { id },
                data: { isActive },
                include: { providerServices: true }
            });
            return provider;
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        throw new common_1.NotFoundException(`Provider with ID ${id} not found`);
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error updating provider status');
        }
    }
    async addServices(providerId, serviceIds) {
        try {
            const existingServices = await this.prisma.providerService.findMany({
                where: { providerId }
            });
            const existingServiceIds = existingServices.map(ps => ps.serviceId);
            const newServiceIds = serviceIds.filter(id => !existingServiceIds.includes(id));
            if (newServiceIds.length > 0) {
                await this.prisma.providerService.createMany({
                    data: newServiceIds.map(serviceId => ({
                        providerId,
                        serviceId
                    }))
                });
            }
            return this.prisma.provider.findUnique({
                where: { id: providerId },
                include: { providerServices: true }
            });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2003':
                        throw new common_1.BadRequestException('Invalid service reference provided');
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error adding services to provider');
        }
    }
    async removeServices(providerId, serviceIds) {
        try {
            await this.prisma.providerService.deleteMany({
                where: {
                    providerId,
                    serviceId: { in: serviceIds }
                }
            });
            return this.prisma.provider.findUnique({
                where: { id: providerId },
                include: { providerServices: true }
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error removing services from provider');
        }
    }
    async getProviderServices(providerId) {
        try {
            return await this.prisma.providerService.findMany({
                where: { providerId },
                include: {
                    service: true
                }
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error fetching provider services');
        }
    }
    async getProviderOrders(providerId) {
        try {
            return await this.prisma.order.findMany({
                where: { providerId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    },
                    service: {
                        select: {
                            id: true,
                            title: true,
                            description: true
                        }
                    }
                },
                orderBy: {
                    orderDate: 'desc'
                }
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error fetching provider orders');
        }
    }
    async getProviderRatings(providerId) {
        try {
            return await this.prisma.providerRating.findMany({
                where: { providerId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    ratingDate: 'desc'
                }
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error fetching provider ratings');
        }
    }
    async getProviderDocuments(providerId) {
        try {
            const verification = await this.prisma.providerVerification.findUnique({
                where: { providerId },
                include: {
                    provider: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });
            if (!verification) {
                return {
                    documents: [],
                    verificationStatus: 'pending',
                    adminNotes: null
                };
            }
            const documents = verification.documents.map((url, index) => {
                const relativeUrl = url.startsWith('http')
                    ? url.replace(/^https?:\/\/[^\/]+/, '')
                    : url;
                return {
                    id: `doc-${index}`,
                    name: url.split('/').pop() || `Document ${index + 1}`,
                    url: relativeUrl,
                    type: this.getFileTypeFromUrl(url),
                    size: 0,
                    uploadedAt: verification.createdAt.toISOString(),
                    uploadedBy: 'Admin'
                };
            });
            return {
                documents,
                verificationStatus: verification.status,
                adminNotes: verification.adminNotes
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error fetching provider documents');
        }
    }
    getFileTypeFromUrl(url) {
        const extension = url.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'application/pdf';
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            default:
                return 'application/octet-stream';
        }
    }
    async remove(id) {
        try {
            await this.prisma.provider.delete({ where: { id } });
            return { message: 'Provider deleted successfully' };
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        throw new common_1.NotFoundException(`Provider with ID ${id} not found`);
                    default:
                        throw new common_1.InternalServerErrorException('Database operation failed');
                }
            }
            throw new common_1.InternalServerErrorException('Error deleting provider');
        }
    }
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProvidersService);
//# sourceMappingURL=providers.service.js.map