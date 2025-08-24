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
    async getProfile(providerId) {
        try {
            const provider = await this.prisma.provider.findUnique({
                where: { id: providerId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    description: true,
                    state: true,
                    phone: true,
                    isActive: true,
                    isVerified: true,
                    location: true,
                    officialDocuments: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (!provider) {
                throw new common_1.NotFoundException(`Provider with ID ${providerId} not found`);
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
                provider,
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
            throw new common_1.InternalServerErrorException('Error fetching provider profile');
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
            const orders = await this.prisma.order.findMany({
                where: { providerId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            latitude: true,
                            longitude: true
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
            return {
                orders: orders,
                total: orders.length,
                status: 'all'
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error fetching provider orders');
        }
    }
    async getProviderOrdersByStatus(providerId, status) {
        try {
            const orders = await this.prisma.order.findMany({
                where: {
                    providerId,
                    status: status.toLowerCase()
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            latitude: true,
                            longitude: true
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
            return {
                orders: orders,
                total: orders.length,
                status: status.toLowerCase()
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('Error fetching provider orders by status');
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
                            email: true,
                            latitude: true,
                            longitude: true
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
    async findProvidersByServiceId(serviceId) {
        try {
            const service = await this.prisma.service.findUnique({
                where: { id: serviceId }
            });
            if (!service) {
                throw new common_1.NotFoundException(`Service with ID ${serviceId} not found`);
            }
            const providers = await this.prisma.provider.findMany({
                where: {
                    providerServices: {
                        some: {
                            serviceId: serviceId,
                            isActive: true
                        }
                    },
                    isActive: true,
                    isVerified: true
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    description: true,
                    state: true,
                    phone: true,
                    location: true,
                    isActive: true,
                    isVerified: true,
                    createdAt: true,
                    providerServices: {
                        where: {
                            serviceId: serviceId,
                            isActive: true
                        },
                        select: {
                            price: true,
                            isActive: true
                        }
                    }
                }
            });
            return {
                providers,
                total: providers.length,
                serviceId: serviceId
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error fetching providers by service');
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
    async updateFCMToken(providerId, fcmToken) {
        try {
            const updatedProvider = await this.prisma.provider.update({
                where: { id: providerId },
                data: { fcm: fcmToken },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    fcm: true,
                    updatedAt: true
                }
            });
            return updatedProvider;
        }
        catch (error) {
            throw new Error(`Failed to update FCM token for provider ${providerId}: ${error.message}`);
        }
    }
    async removeFCMToken(providerId) {
        try {
            const updatedProvider = await this.prisma.provider.update({
                where: { id: providerId },
                data: { fcm: null },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    fcm: true,
                    updatedAt: true
                }
            });
            return updatedProvider;
        }
        catch (error) {
            throw new Error(`Failed to remove FCM token for provider ${providerId}: ${error.message}`);
        }
    }
    async getProviderFullDetails(providerId) {
        try {
            const provider = await this.prisma.provider.findUnique({
                where: { id: providerId },
                include: {
                    providerServices: {
                        include: {
                            service: {
                                include: {
                                    category: true
                                }
                            }
                        }
                    },
                    offers: {
                        include: {
                            service: true
                        }
                    },
                    ratings: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        }
                    },
                    orders: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true,
                                    latitude: true,
                                    longitude: true
                                }
                            },
                            service: {
                                select: {
                                    id: true,
                                    title: true,
                                    description: true
                                }
                            }
                        }
                    },
                    verification: true,
                    joinRequests: {
                        orderBy: {
                            requestDate: 'desc'
                        },
                        take: 1
                    }
                }
            });
            if (!provider) {
                throw new common_1.NotFoundException(`Provider with ID ${providerId} not found`);
            }
            const totalOrders = provider.orders.length;
            const completedOrders = provider.orders.filter(order => order.status === 'completed').length;
            const pendingOrders = provider.orders.filter(order => order.status === 'pending').length;
            const totalEarnings = provider.orders
                .filter(order => order.status === 'completed')
                .reduce((sum, order) => sum + order.providerAmount, 0);
            const totalCommission = provider.orders
                .filter(order => order.status === 'completed')
                .reduce((sum, order) => sum + order.commissionAmount, 0);
            const totalRatings = provider.ratings.length;
            const averageRating = totalRatings > 0
                ? provider.ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
                : 0;
            const providerServices = provider.providerServices.map(ps => ({
                id: ps.id,
                price: ps.price,
                isActive: ps.isActive,
                service: {
                    id: ps.service.id,
                    title: ps.service.title,
                    description: ps.service.description,
                    image: ps.service.image,
                    commission: ps.service.commission,
                    categoryId: ps.service.categoryId || 0
                }
            }));
            const offers = provider.offers.map(offer => ({
                id: offer.id,
                startDate: offer.startDate,
                endDate: offer.endDate,
                description: offer.description,
                isActive: offer.isActive,
                offerPrice: offer.offerPrice,
                originalPrice: offer.originalPrice,
                service: {
                    id: offer.service.id,
                    title: offer.service.title,
                    description: offer.service.description
                }
            }));
            const ratings = provider.ratings.map(rating => ({
                id: rating.id,
                rating: rating.rating,
                comment: rating.comment,
                ratingDate: rating.ratingDate,
                orderId: rating.orderId,
                user: {
                    id: rating.user.id,
                    name: rating.user.name,
                    email: rating.user.email,
                    phone: rating.user.phone
                }
            }));
            const orders = provider.orders.map(order => ({
                id: order.id,
                status: order.status,
                orderDate: order.orderDate,
                scheduledDate: order.scheduledDate,
                location: order.location,
                locationDetails: order.locationDetails,
                quantity: order.quantity,
                totalAmount: order.totalAmount,
                providerAmount: order.providerAmount,
                commissionAmount: order.commissionAmount,
                bookingId: order.bookingId,
                user: {
                    id: order.user.id,
                    name: order.user.name,
                    email: order.user.email,
                    phone: order.user.phone,
                    latitude: order.user.latitude ? Number(order.user.latitude) : null,
                    longitude: order.user.longitude ? Number(order.user.longitude) : null
                },
                service: {
                    id: order.service.id,
                    title: order.service.title,
                    description: order.service.description
                }
            }));
            return {
                id: provider.id,
                name: provider.name,
                email: provider.email,
                image: provider.image,
                description: provider.description,
                state: provider.state,
                phone: provider.phone,
                isActive: provider.isActive,
                isVerified: provider.isVerified,
                location: provider.location,
                officialDocuments: provider.officialDocuments,
                createdAt: provider.createdAt,
                updatedAt: provider.updatedAt,
                fcm: provider.fcm,
                providerServices,
                offers,
                ratings,
                averageRating: Math.round(averageRating * 100) / 100,
                totalRatings,
                orders,
                totalOrders,
                completedOrders,
                pendingOrders,
                verification: provider.verification ? {
                    id: provider.verification.id,
                    status: provider.verification.status,
                    documents: provider.verification.documents,
                    adminNotes: provider.verification.adminNotes,
                    createdAt: provider.verification.createdAt,
                    updatedAt: provider.verification.updatedAt
                } : undefined,
                joinRequest: provider.joinRequests.length > 0 ? {
                    id: provider.joinRequests[0].id,
                    requestDate: provider.joinRequests[0].requestDate,
                    status: provider.joinRequests[0].status,
                    adminNotes: provider.joinRequests[0].adminNotes
                } : undefined,
                totalEarnings: Math.round(totalEarnings * 100) / 100,
                totalCommission: Math.round(totalCommission * 100) / 100
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Error fetching provider full details');
        }
    }
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProvidersService);
//# sourceMappingURL=providers.service.js.map