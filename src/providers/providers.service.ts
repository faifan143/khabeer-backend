import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import {
  ChangePhoneRequestDto,
  VerifyPhoneChangeDto,
  PhoneChangeResponseDto,
} from './dto/change-phone.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  ProviderOrderResponseDto,
  ProviderOrdersResponseDto,
} from './dto/provider-orders-response.dto';
import { ProvidersByServiceResponseDto } from './dto/providers-by-service-response.dto';
import { ProviderFullDetailsDto } from './dto/provider-full-details.dto';
import { ProviderPendingCountResponseDto } from './dto/provider-pending-count.dto';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
  ) {}

  async findAll(userRole?: string) {
    try {
      const where: any = {};

      // Skip provider filtering for admins
      if (userRole !== 'ADMIN') {
        where.isActive = true;
        where.onlineStatus = true;
      }

      const providers = await this.prisma.provider.findMany({
        where,
        select: {
          id: true,
          name: true,
          image: true,
          description: true,
          state: true,
          phone: true,
          location: true,
          isActive: true,
          onlineStatus: true,
          isVerified: true,
          createdAt: true,
          providerServices: {
            where: {
              isActive: true,
            },
            include: {
              service: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // Enhance providers with rating information
      const providersWithRatings = await Promise.all(
        providers.map(async (provider) => {
          // Fetch ratings for this provider
          const ratings = await this.prisma.providerRating.findMany({
            where: { providerId: provider.id },
            select: { rating: true },
          });

          // Calculate average rating and total ratings
          const totalRatings = ratings.length;
          const averageRating =
            totalRatings > 0
              ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
              : 0;

          return {
            ...provider,
            averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
            totalRatings,
          };
        }),
      );

      return providersWithRatings;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching providers');
    }
  }

  // Internal methods for authentication (return passwords)
  async findByEmailWithPassword(email: string) {
    try {
      return await this.prisma.provider.findUnique({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException('Error finding provider by email');
    }
  }

  async findByPhoneWithPassword(phone: string) {
    try {
      return await this.prisma.provider.findFirst({ where: { phone } });
    } catch (error) {
      throw new InternalServerErrorException('Error finding provider by phone');
    }
  }

  async findByIdWithPassword(id: number) {
    try {
      const provider = await this.prisma.provider.findUnique({ where: { id } });
      if (!provider) {
        throw new NotFoundException(`Provider with ID ${id} not found`);
      }
      return provider;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error finding provider');
    }
  }

  // Public methods (no passwords)
  async findByEmail(email: string) {
    try {
      return await this.prisma.provider.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          description: true,
          state: true,
          phone: true,
          isActive: true,
          onlineStatus: true,
          isVerified: true,
          location: true,
          officialDocuments: true,
          createdAt: true,
          updatedAt: true,
          fcm: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error finding provider by email');
    }
  }

  async findByPhone(phone: string) {
    try {
      return await this.prisma.provider.findFirst({
        where: { phone },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          description: true,
          state: true,
          phone: true,
          isActive: true,
          onlineStatus: true,
          isVerified: true,
          location: true,
          officialDocuments: true,
          createdAt: true,
          updatedAt: true,
          fcm: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error finding provider by phone');
    }
  }

  async findById(id: number) {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id },
        include: {
          offers: true,
          orders: true,
          ratings: true,
          providerServices: {
            where: {
              isActive: true,
            },
            include: {
              service: {
                include: {
                  category: true,
                  offers: {
                    where: {
                      isActive: true,
                      providerId: id,
                      startDate: { lte: new Date() },
                      endDate: { gt: new Date() },
                    },
                    orderBy: {
                      offerPrice: 'asc',
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });
      if (!provider) {
        throw new NotFoundException(`Provider with ID ${id} not found`);
      }

      // Transform offers array to single object for each service
      const transformedProvider = {
        ...provider,
        providerServices: provider.providerServices.map((ps) => ({
          ...ps,
          service: {
            ...ps.service,
            // Return numeric offerPrice if available, otherwise null
            offerPrice:
              ps.service.offers.length > 0
                ? ps.service.offers[0].offerPrice
                : null,
          },
        })),
      };

      return transformedProvider;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error finding provider');
    }
  }

  async getProfile(providerId: number) {
    try {
      // Get provider information
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
          onlineStatus: true,
          location: true,
          officialDocuments: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${providerId} not found`);
      }

      // Get system settings for social media, legal documents, and support
      const systemSettings = await this.prisma.systemSettings.findMany({
        where: {
          category: {
            in: ['social', 'legal', 'support'],
          },
        },
      });

      // Group settings by category and map to expected field names
      const groupedSettings = systemSettings.reduce(
        (acc: Record<string, Record<string, string>>, setting) => {
          if (!acc[setting.category]) {
            acc[setting.category] = {};
          }
          acc[setting.category][setting.key] = setting.value;
          return acc;
        },
        {},
      );

      // Map to the exact structure expected by Flutter models
      let socialMedia = {
        whatsapp: null,
        instagram: null,
        facebook: null,
        tiktok: null,
        snapchat: null,
      };

      // Parse social media links if they exist
      if (groupedSettings.social?.social_links) {
        try {
          const parsedSocialLinks = JSON.parse(
            groupedSettings.social.social_links,
          );
          socialMedia = {
            whatsapp: parsedSocialLinks.whatsapp || null,
            instagram: parsedSocialLinks.instagram || null,
            facebook: parsedSocialLinks.facebook || null,
            tiktok: parsedSocialLinks.tiktok || null,
            snapchat: parsedSocialLinks.snapchat || null,
          };
        } catch (parseError) {
          console.error('Failed to parse social media links:', parseError);
          console.error(
            'Raw social_links value:',
            groupedSettings.social.social_links,
          );
        }
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
          support,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching provider profile');
    }
  }

  async create(data: CreateProviderDto) {
    try {
      const provider = await this.prisma.provider.create({ data });

      // Return provider without password
      const { password, ...providerWithoutPassword } = provider;
      return providerWithoutPassword;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            if (
              error.meta?.target &&
              Array.isArray(error.meta.target) &&
              error.meta.target.includes('email')
            ) {
              throw new BadRequestException(
                'Provider with this email already exists',
              );
            }
            break;
          case 'P2003':
            throw new BadRequestException('Invalid reference data provided');
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException('Error creating provider');
    }
  }

  async registerProviderWithCategories(data: CreateProviderDto) {
    try {
      const { categoryIds, ...providerData } = data;

      console.log('🔍 registerProviderWithCategories received:', {
        categoryIds: categoryIds,
        categoryIdsLength: categoryIds?.length || 0,
      });

      // Prepare provider categories data
      let providerCategoriesData: Array<{
        categoryId: number;
        isActive: boolean;
      }> = [];

      // Handle categoryIds
      if (categoryIds && categoryIds.length > 0) {
        console.log('🔍 Processing categories:', categoryIds);
        providerCategoriesData = categoryIds.map((categoryId) => ({
          categoryId: Number(categoryId), // Convert to number
          isActive: true,
        }));
        console.log(
          '🔍 Mapped provider categories data:',
          providerCategoriesData,
        );
      }

      console.log('🔍 About to create provider with data:', {
        ...providerData,
        providerCategories: {
          create: providerCategoriesData,
        },
      });

      const provider = await this.prisma.provider.create({
        data: {
          ...providerData,
          providerCategories: {
            create: providerCategoriesData,
          },
        },
        include: {
          providerCategories: {
            include: {
              category: {
                select: {
                  id: true,
                  titleAr: true,
                  titleEn: true,
                  state: true,
                },
              },
            },
          },
        },
      });

      // Return provider without password
      const { password, ...providerWithoutPassword } = provider;
      console.log('🔍 Provider created successfully:', {
        id: provider.id,
        name: provider.name,
        categoryCount: provider.providerCategories?.length || 0,
      });
      return providerWithoutPassword;
    } catch (error) {
      console.error('🔍 Error in registerProviderWithCategories:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        stack: error.stack,
      });

      if (error instanceof PrismaClientKnownRequestError) {
        console.error('🔍 Prisma error code:', error.code);
        switch (error.code) {
          case 'P2002':
            if (
              error.meta?.target &&
              Array.isArray(error.meta.target) &&
              error.meta.target.includes('email')
            ) {
              throw new BadRequestException(
                'Provider with this email already exists',
              );
            }
            break;
          case 'P2003':
            throw new BadRequestException(
              'Invalid category reference provided',
            );
          default:
            console.error('🔍 Unhandled Prisma error:', error.code);
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      console.error('🔍 Non-Prisma error:', error);
      throw new InternalServerErrorException(
        'Error registering provider with categories',
      );
    }
  }

  async update(id: number, data: UpdateProviderDto) {
    try {
      const { serviceIds, ...providerData } = data;

      // If serviceIds are provided, update the provider services
      if (serviceIds !== undefined) {
        // First, delete existing provider services
        await this.prisma.providerService.deleteMany({
          where: { providerId: id },
        });

        // Then create new provider services
        if (serviceIds && serviceIds.length > 0) {
          await this.prisma.providerService.createMany({
            data: serviceIds.map((serviceId) => ({
              providerId: id,
              serviceId,
            })),
          });
        }
      }

      const provider = await this.prisma.provider.update({
        where: { id },
        data: providerData,
        include: { providerServices: true },
      });

      // Return provider without password
      const { password, ...providerWithoutPassword } = provider;
      return providerWithoutPassword;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(`Provider with ID ${id} not found`);
          case 'P2002':
            if (
              error.meta?.target &&
              Array.isArray(error.meta.target) &&
              error.meta.target.includes('email')
            ) {
              throw new BadRequestException(
                'Provider with this email already exists',
              );
            }
            break;
          case 'P2003':
            throw new BadRequestException('Invalid service reference provided');
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException('Error updating provider');
    }
  }

  async updateStatus(id: number, isActive: boolean) {
    try {
      const provider = await this.prisma.provider.update({
        where: { id },
        data: { isActive },
        include: { providerServices: true },
      });

      // Return provider without password
      const { password, ...providerWithoutPassword } = provider;
      return providerWithoutPassword;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(`Provider with ID ${id} not found`);
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException('Error updating provider status');
    }
  }

  async getOnlineStatus(id: number) {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id },
        select: {
          id: true,
          onlineStatus: true,
        },
      });

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${id} not found`);
      }

      return provider;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error getting provider online status',
      );
    }
  }

  async updateOnlineStatus(id: number, onlineStatus: boolean) {
    try {
      const provider = await this.prisma.provider.update({
        where: { id },
        data: { onlineStatus },
        include: { providerServices: true },
      });

      // Return provider without password
      const { password, ...providerWithoutPassword } = provider;
      return providerWithoutPassword;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(`Provider with ID ${id} not found`);
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException(
        'Error updating provider online status',
      );
    }
  }

  async addServices(providerId: number, serviceIds: number[]) {
    try {
      const existingServices = await this.prisma.providerService.findMany({
        where: { providerId },
      });

      const existingServiceIds = existingServices.map((ps) => ps.serviceId);
      const newServiceIds = serviceIds.filter(
        (id) => !existingServiceIds.includes(id),
      );

      if (newServiceIds.length > 0) {
        await this.prisma.providerService.createMany({
          data: newServiceIds.map((serviceId) => ({
            providerId,
            serviceId,
          })),
        });
      }

      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        include: { providerServices: true },
      });

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${providerId} not found`);
      }

      // Return provider without password
      const { password, ...providerWithoutPassword } = provider;
      return providerWithoutPassword;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2003':
            throw new BadRequestException('Invalid service reference provided');
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException(
        'Error adding services to provider',
      );
    }
  }

  async removeServices(providerId: number, serviceIds: number[]) {
    try {
      await this.prisma.providerService.deleteMany({
        where: {
          providerId,
          serviceId: { in: serviceIds },
        },
      });

      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        include: { providerServices: true },
      });

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${providerId} not found`);
      }

      // Return provider without password
      const { password, ...providerWithoutPassword } = provider;
      return providerWithoutPassword;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error removing services from provider',
      );
    }
  }

  async getProviderServices(providerId: number) {
    try {
      return await this.prisma.providerService.findMany({
        where: { providerId },
        include: {
          service: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching provider services',
      );
    }
  }

  private isMultipleServicesOrder(order: any): boolean {
    // Check if this order has multiple services by looking at the quantity and total amount
    return order.quantity > 1 && order.totalAmount > order.providerAmount * 1.2;
  }

  private getServicesBreakdown(order: any): any[] {
    if (!this.isMultipleServicesOrder(order)) {
      return [];
    }

    // For multiple services orders, we need to reconstruct the services array
    // Since we don't store the individual services breakdown in the database,
    // we'll create a reasonable approximation based on the order data

    // Calculate how many services this order represents
    const estimatedServiceCount = Math.ceil(order.quantity / 2); // Estimate based on quantity

    const services: any[] = [];
    const baseQuantity = Math.floor(order.quantity / estimatedServiceCount);
    const remainingQuantity = order.quantity % estimatedServiceCount;

    for (let i = 0; i < estimatedServiceCount; i++) {
      const serviceQuantity =
        i === 0 ? baseQuantity + remainingQuantity : baseQuantity;
      const serviceAmount =
        (order.providerAmount / order.quantity) * serviceQuantity;
      const serviceCommission =
        (order.commissionAmount / order.quantity) * serviceQuantity;

      services.push({
        quantity: serviceQuantity,
        unitPrice: order.providerAmount / order.quantity,
        totalPrice: serviceAmount,
        commissionAmount: serviceCommission,
      });
    }

    return services;
  }

  private buildServicesArray(order: any): any[] {
    if (order.quantity === 1) {
      // For single service orders, return a single-item array - FIXED: Show correct amounts
      const service = order.service;
      return [
        {
          serviceId: service.id,
          serviceTitle: service.titleEn,
          serviceDescription: service.description,
          serviceImage: service.image,
          quantity: 1,
          unitPrice: order.providerAmount,
          totalPrice: order.providerAmount,
          netAmount: order.providerNetAmount, // What provider actually receives
          commission: service.commission || 0,
          commissionAmount: order.commissionAmount,
          commissionDeduction: order.providerAmount - order.providerNetAmount, // Commission deducted from provider
        },
      ];
    } else {
      // For multiple services orders, create a logical breakdown - FIXED: Show correct amounts
      const service = order.service;
      const unitPrice = order.providerAmount / order.quantity;
      const unitNetPrice = order.providerNetAmount / order.quantity;
      const unitCommission = order.commissionAmount / order.quantity;

      // Create a single service entry with the total quantity
      return [
        {
          serviceId: service.id,
          serviceTitle: service.titleEn,
          serviceDescription: service.description,
          serviceImage: service.image,
          quantity: order.quantity,
          unitPrice: unitPrice,
          totalPrice: order.providerAmount,
          netAmount: order.providerNetAmount, // What provider actually receives
          commission: service.commission || 0,
          commissionAmount: order.commissionAmount,
          commissionDeduction: order.providerAmount - order.providerNetAmount, // Commission deducted from provider
        },
      ];
    }
  }

  async getProviderOrders(
    providerId: number,
  ): Promise<ProviderOrdersResponseDto> {
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
              image: true,
              state: true,
              latitude: true,
              longitude: true,
            },
          },
          service: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              description: true,
              image: true,
              commission: true,
              category: {
                select: {
                  id: true,
                  image: true,
                  titleAr: true,
                  titleEn: true,
                  state: true,
                },
              },
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
      });

      // Transform orders to always include services array
      const transformedOrders = orders.map((order) => {
        let services: any[] = [];

        if (order.isMultipleServices && order.servicesBreakdown) {
          // Use the stored services breakdown from the database and enhance with category data
          services = (order.servicesBreakdown as any[]).map((serviceItem) => ({
            ...serviceItem,
            category: order.service.category,
          }));
        } else {
          // For single service orders, create a single-item array with complete data
          const service = order.service;
          services = [
            {
              serviceId: service.id,
              serviceTitle: service.titleEn,
              serviceDescription: service.description,
              serviceImage: service.image,
              quantity: order.quantity,
              unitPrice: order.providerAmount / order.quantity,
              totalPrice: order.providerAmount,
              commission: service.commission || 0,
              commissionAmount: order.commissionAmount,
              category: service.category,
            },
          ];
        }

        // Remove the main service attribute and return only the services array
        const { service, ...orderWithoutService } = order;

        return {
          ...orderWithoutService,
          duration: order.scheduledDate, // Use scheduled date as duration
          isMultipleServices: order.isMultipleServices || false,
          services,
          user: {
            ...order.user,
            image: order.user.image || '',
            state: order.user.state || '',
            latitude: order.user.latitude ? Number(order.user.latitude) : null,
            longitude: order.user.longitude
              ? Number(order.user.longitude)
              : null,
          },
        };
      });

      return {
        orders: transformedOrders as unknown as ProviderOrderResponseDto[],
        total: transformedOrders.length,
        status: 'all',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching provider orders');
    }
  }

  async getProviderOrdersByStatus(
    providerId: number,
    status: string,
  ): Promise<ProviderOrdersResponseDto> {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          providerId,
          status: status.toLowerCase(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
              state: true,
              latitude: true,
              longitude: true,
            },
          },
          service: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              description: true,
              image: true,
              commission: true,
              category: {
                select: {
                  id: true,
                  image: true,
                  titleAr: true,
                  titleEn: true,
                  state: true,
                },
              },
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
      });

      // Transform orders to always include services array
      const transformedOrders = orders.map((order) => {
        let services: any[] = [];

        if (order.isMultipleServices && order.servicesBreakdown) {
          // Use the stored services breakdown from the database and enhance with category data
          services = (order.servicesBreakdown as any[]).map((serviceItem) => ({
            ...serviceItem,
            category: order.service.category,
          }));
        } else {
          // For single service orders, create a single-item array with complete data
          const service = order.service;
          services = [
            {
              serviceId: service.id,
              serviceTitle: service.titleEn,
              serviceDescription: service.description,
              serviceImage: service.image,
              quantity: order.quantity,
              unitPrice: order.providerAmount / order.quantity,
              totalPrice: order.providerAmount,
              commission: service.commission || 0,
              commissionAmount: order.commissionAmount,
              category: service.category,
            },
          ];
        }

        // Remove the main service attribute and return only the services array
        const { service, ...orderWithoutService } = order;

        return {
          ...orderWithoutService,
          duration: order.scheduledDate, // Use scheduled date as duration
          isMultipleServices: order.isMultipleServices || false,
          services,
          user: {
            ...order.user,
            image: order.user.image || '',
            state: order.user.state || '',
            latitude: order.user.latitude ? Number(order.user.latitude) : null,
            longitude: order.user.longitude
              ? Number(order.user.longitude)
              : null,
          },
        };
      });

      return {
        orders: transformedOrders as unknown as ProviderOrderResponseDto[],
        total: transformedOrders.length,
        status: status.toLowerCase(),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching provider orders by status',
      );
    }
  }

  async getProviderPendingOrders(
    providerId: number,
  ): Promise<ProviderOrdersResponseDto> {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          providerId,
          status: 'pending',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
              state: true,
              latitude: true,
              longitude: true,
            },
          },
          service: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              description: true,
              image: true,
              commission: true,
              category: {
                select: {
                  id: true,
                  image: true,
                  titleAr: true,
                  titleEn: true,
                  state: true,
                },
              },
            },
          },
        },
        orderBy: {
          orderDate: 'desc',
        },
      });

      // Transform orders to always include services array
      const transformedOrders = orders.map((order) => {
        let services: any[] = [];

        if (order.isMultipleServices && order.servicesBreakdown) {
          // Use the stored services breakdown from the database and enhance with category data
          services = (order.servicesBreakdown as any[]).map((serviceItem) => ({
            ...serviceItem,
            category: order.service.category,
          }));
        } else {
          // For single service orders, create a single-item array with complete data
          const service = order.service;
          services = [
            {
              serviceId: service.id,
              serviceTitle: service.titleEn,
              serviceDescription: service.description,
              serviceImage: service.image,
              quantity: order.quantity,
              unitPrice: order.providerAmount / order.quantity,
              totalPrice: order.providerAmount,
              commission: service.commission || 0,
              commissionAmount: order.commissionAmount,
              category: service.category,
            },
          ];
        }

        // Remove the main service attribute and return only the services array
        const { service, ...orderWithoutService } = order;

        return {
          ...orderWithoutService,
          duration: order.scheduledDate, // Use scheduled date as duration
          isMultipleServices: order.isMultipleServices || false,
          services,
          user: {
            ...order.user,
            image: order.user.image || '',
            state: order.user.state || '',
            latitude: order.user.latitude ? Number(order.user.latitude) : null,
            longitude: order.user.longitude
              ? Number(order.user.longitude)
              : null,
          },
        };
      });

      return {
        orders: transformedOrders as unknown as ProviderOrderResponseDto[],
        total: transformedOrders.length,
        status: 'pending',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching provider pending orders',
      );
    }
  }

  async getProviderPendingOrdersCount(
    providerId: number,
  ): Promise<ProviderPendingCountResponseDto> {
    try {
      const [count, whatsappSupport] = await Promise.all([
        this.prisma.order.count({
          where: {
            providerId,
            status: 'pending',
          },
        }),
        this.prisma.systemSettings.findUnique({
          where: {
            key: 'whatsapp_support',
          },
          select: {
            value: true,
          },
        }),
      ]);

      return {
        count,
        status: 'pending',
        support: whatsappSupport?.value || null,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching provider pending orders count',
      );
    }
  }

  async getProviderStats(providerId: number) {
    try {
      const [pendingOrdersCount, servicesCount, whatsappSupport] =
        await Promise.all([
          this.prisma.order.count({
            where: {
              providerId,
              status: 'pending',
            },
          }),
          this.prisma.providerService.count({
            where: {
              providerId,
              isActive: true,
            },
          }),
          this.prisma.systemSettings.findUnique({
            where: {
              key: 'whatsapp_support',
            },
            select: {
              value: true,
            },
          }),
        ]);

      return {
        pendingOrdersCount,
        servicesCount,
        support: whatsappSupport?.value || null,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching provider stats');
    }
  }

  async getProviderRatings(providerId: number) {
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
              longitude: true,
            },
          },
        },
        orderBy: {
          ratingDate: 'desc',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching provider ratings');
    }
  }

  async getProviderDocuments(providerId: number) {
    try {
      const verification = await this.prisma.providerVerification.findUnique({
        where: { providerId },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!verification) {
        return {
          documents: [],
          verificationStatus: 'pending',
          adminNotes: null,
        };
      }

      // Convert document URLs to document objects with relative URLs
      const documents = verification.documents.map((url, index) => {
        // Ensure we have a relative URL (remove any base URL if present)
        const relativeUrl = url.startsWith('http')
          ? url.replace(/^https?:\/\/[^\/]+/, '')
          : url;

        return {
          id: `doc-${index}`,
          name: url.split('/').pop() || `Document ${index + 1}`,
          url: relativeUrl,
          type: this.getFileTypeFromUrl(url),
          size: 0, // We don't store file size in the database
          uploadedAt: verification.createdAt.toISOString(),
          uploadedBy: 'Admin',
        };
      });

      return {
        documents,
        verificationStatus: verification.status,
        adminNotes: verification.adminNotes,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching provider documents',
      );
    }
  }

  private getFileTypeFromUrl(url: string): string {
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

  async findProvidersByServiceId(
    serviceId: number,
    userRole?: string,
  ): Promise<ProvidersByServiceResponseDto> {
    try {
      // First check if the service exists
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }

      const where: any = {
        providerServices: {
          some: {
            serviceId: serviceId,
            isActive: true,
          },
        },
        isVerified: true,
      };

      // Skip provider filtering for admins
      if (userRole !== 'ADMIN') {
        where.isActive = true;
        where.onlineStatus = true;
      }

      const providers = await this.prisma.provider.findMany({
        where,
        select: {
          id: true,
          name: true,
          image: true,
          description: true,
          state: true,
          phone: true,
          location: true,
          isActive: true,
          onlineStatus: true,
          isVerified: true,
          createdAt: true,
          providerServices: {
            where: {
              serviceId: serviceId,
              isActive: true,
            },
            select: {
              price: true,
              isActive: true,
            },
          },
        },
      });

      // Enhance providers with offer information
      const providersWithOffers = await Promise.all(
        providers.map(async (provider) => {
          const enhancedProviderServices = await Promise.all(
            provider.providerServices.map(async (providerService) => {
              // Get offer for this provider service - using the SAME date validation logic as all offer endpoints
              const now = new Date();
              const offer = await this.prisma.offer.findFirst({
                where: {
                  providerId: provider.id,
                  serviceId: serviceId,
                  isActive: true,
                  startDate: { lte: now },
                  endDate: { gt: now },
                },
                orderBy: {
                  startDate: 'desc',
                },
              });

              return {
                ...providerService,
                offerPrice: offer ? offer.offerPrice : null,
              };
            }),
          );

          // Fetch ratings for this provider
          const ratings = await this.prisma.providerRating.findMany({
            where: { providerId: provider.id },
            select: { rating: true },
          });

          // Calculate average rating and total ratings
          const totalRatings = ratings.length;
          const averageRating =
            totalRatings > 0
              ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
              : 0;

          return {
            ...provider,
            providerServices: enhancedProviderServices,
            averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
            totalRatings,
          };
        }),
      );

      return {
        providers: providersWithOffers,
        total: providersWithOffers.length,
        serviceId: serviceId,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error fetching providers by service',
      );
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.provider.delete({ where: { id } });
      return { message: 'Provider deleted successfully' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(`Provider with ID ${id} not found`);
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException('Error deleting provider');
    }
  }

  async updateFCMToken(providerId: number, fcmToken: string): Promise<any> {
    try {
      const updatedProvider = await this.prisma.provider.update({
        where: { id: providerId },
        data: { fcm: fcmToken },
        select: {
          id: true,
          email: true,
          name: true,
          fcm: true,
          updatedAt: true,
        },
      });

      return updatedProvider;
    } catch (error) {
      throw new Error(
        `Failed to update FCM token for provider ${providerId}: ${error.message}`,
      );
    }
  }

  async removeFCMToken(providerId: number): Promise<any> {
    try {
      const updatedProvider = await this.prisma.provider.update({
        where: { id: providerId },
        data: { fcm: null },
        select: {
          id: true,
          email: true,
          name: true,
          fcm: true,
          updatedAt: true,
        },
      });

      return updatedProvider;
    } catch (error) {
      throw new Error(
        `Failed to remove FCM token for provider ${providerId}: ${error.message}`,
      );
    }
  }

  async getProviderFullDetails(
    providerId: number,
  ): Promise<ProviderFullDetailsDto> {
    try {
      // Get provider with all related data
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        include: {
          providerServices: {
            include: {
              service: {
                include: {
                  category: true,
                },
              },
            },
          },
          offers: {
            include: {
              service: true,
            },
          },
          ratings: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
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
                  longitude: true,
                },
              },
              service: {
                select: {
                  id: true,
                  titleAr: true,
                  titleEn: true,
                  description: true,
                },
              },
            },
          },
          verification: true,
          joinRequests: {
            orderBy: {
              requestDate: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${providerId} not found`);
      }

      // Calculate statistics
      const totalOrders = provider.orders.length;
      const completedOrders = provider.orders.filter(
        (order) => order.status === 'completed',
      ).length;
      const pendingOrders = provider.orders.filter(
        (order) => order.status === 'pending',
      ).length;

      const totalEarnings = provider.orders
        .filter((order) => order.status === 'completed')
        .reduce((sum, order) => sum + order.providerAmount, 0);

      const totalCommission = provider.orders
        .filter((order) => order.status === 'completed')
        .reduce((sum, order) => sum + order.commissionAmount, 0);

      // Calculate average rating
      const totalRatings = provider.ratings.length;
      const averageRating =
        totalRatings > 0
          ? provider.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
            totalRatings
          : 0;

      // Transform data to match DTO structure
      const providerServices = provider.providerServices.map((ps) => ({
        id: ps.id,
        price: ps.price,
        isActive: ps.isActive,
        service: {
          id: ps.service.id,
          title: ps.service.titleEn,
          description: ps.service.description,
          image: ps.service.image,
          commission: ps.service.commission,
          categoryId: ps.service.categoryId || 0,
        },
      }));

      const offers = provider.offers.map((offer) => ({
        id: offer.id,
        startDate: offer.startDate,
        endDate: offer.endDate,
        description: offer.description,
        isActive: offer.isActive,
        offerPrice: offer.offerPrice,
        originalPrice: offer.originalPrice,
        service: {
          id: offer.service.id,
          title: offer.service.titleEn,
          description: offer.service.description,
        },
      }));

      const ratings = provider.ratings.map((rating) => ({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        ratingDate: rating.ratingDate,
        orderId: rating.orderId,
        user: {
          id: rating.user.id,
          name: rating.user.name,
          email: rating.user.email,
          phone: rating.user.phone,
        },
      }));

      const orders = provider.orders.map((order) => ({
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
          longitude: order.user.longitude ? Number(order.user.longitude) : null,
        },
        service: {
          id: order.service.id,
          title: order.service.titleEn,
          description: order.service.description,
        },
      }));

      return {
        // Basic provider information
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

        // Related services
        providerServices,

        // Offers
        offers,

        // Ratings and reviews
        ratings,
        averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        totalRatings,

        // Orders
        orders,
        totalOrders,
        completedOrders,
        pendingOrders,

        // Verification and join request
        verification: provider.verification
          ? {
              id: provider.verification.id,
              status: provider.verification.status,
              documents: provider.verification.documents,
              adminNotes: provider.verification.adminNotes,
              createdAt: provider.verification.createdAt,
              updatedAt: provider.verification.updatedAt,
            }
          : undefined,

        joinRequest:
          provider.joinRequests.length > 0
            ? {
                id: provider.joinRequests[0].id,
                requestDate: provider.joinRequests[0].requestDate,
                status: provider.joinRequests[0].status,
                adminNotes: provider.joinRequests[0].adminNotes,
              }
            : undefined,

        // Statistics
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error fetching provider full details',
      );
    }
  }

  private async getActiveOffer(providerId: number, serviceId: number) {
    const now = new Date();

    // Use the same date validation logic as all other offer endpoints
    const activeOffer = await this.prisma.offer.findFirst({
      where: {
        providerId,
        serviceId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gt: now },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        description: true,
        offerPrice: true,
        originalPrice: true,
      },
      orderBy: {
        offerPrice: 'asc', // Get the best (lowest) offer price
      },
    });

    return activeOffer;
  }

  async getProviderCategories(providerId: number) {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { id: true, name: true },
      });

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${providerId} not found`);
      }

      const providerCategories = await this.prisma.providerCategory.findMany({
        where: {
          providerId: providerId,
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              state: true,
              image: true,
            },
          },
        },
        orderBy: {
          category: {
            titleEn: 'asc',
          },
        },
      });

      return {
        providerId: provider.id,
        providerName: provider.name,
        categories: providerCategories.map((pc) => pc.category),
      };
    } catch (error) {
      console.error('Error getting provider categories:', error);
      throw new InternalServerErrorException(
        'Error fetching provider categories',
      );
    }
  }

  async addProviderCategories(providerId: number, categoryIds: number[]) {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${providerId} not found`);
      }

      // Check if categories exist
      const categories = await this.prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true },
      });

      if (categories.length !== categoryIds.length) {
        throw new BadRequestException('One or more categories not found');
      }

      // Check for existing provider categories
      const existingCategories = await this.prisma.providerCategory.findMany({
        where: {
          providerId: providerId,
          categoryId: { in: categoryIds },
        },
        select: { categoryId: true },
      });

      const existingCategoryIds = existingCategories.map((ec) => ec.categoryId);
      const newCategoryIds = categoryIds.filter(
        (id) => !existingCategoryIds.includes(id),
      );

      if (newCategoryIds.length === 0) {
        throw new BadRequestException(
          'Provider is already registered for all specified categories',
        );
      }

      // Create new provider categories
      const providerCategories = await this.prisma.providerCategory.createMany({
        data: newCategoryIds.map((categoryId) => ({
          providerId: providerId,
          categoryId: categoryId,
          isActive: true,
        })),
      });

      return {
        message: `Added ${providerCategories.count} new categories`,
        addedCategoryIds: newCategoryIds,
      };
    } catch (error) {
      console.error('Error adding provider categories:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error adding provider categories',
      );
    }
  }

  async removeProviderCategories(providerId: number, categoryIds: number[]) {
    try {
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
      });

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${providerId} not found`);
      }

      // Remove provider categories
      const result = await this.prisma.providerCategory.deleteMany({
        where: {
          providerId: providerId,
          categoryId: { in: categoryIds },
        },
      });

      return {
        message: `Removed ${result.count} categories`,
        removedCategoryIds: categoryIds,
      };
    } catch (error) {
      console.error('Error removing provider categories:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error removing provider categories',
      );
    }
  }

  async getServicesByProviderCategories(providerId: number) {
    try {
      // First, verify that provider exists
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { id: true, name: true },
      });

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${providerId} not found`);
      }

      // Get provider's registered categories
      const providerCategories = await this.prisma.providerCategory.findMany({
        where: {
          providerId: providerId,
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              state: true,
            },
          },
        },
      });

      if (providerCategories.length === 0) {
        return {
          providerId: provider.id,
          providerName: provider.name,
          categories: [],
          services: [],
        };
      }

      const categoryIds = providerCategories.map((pc) => pc.categoryId);

      // Get all services from provider's registered categories
      const services = await this.prisma.service.findMany({
        where: {
          categoryId: { in: categoryIds },
          serviceType: 'NORMAL',
        },
        include: {
          category: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              state: true,
            },
          },
        },
        orderBy: {
          titleEn: 'asc',
        },
      });

      return {
        providerId: provider.id,
        providerName: provider.name,
        categories: providerCategories.map((pc) => pc.category),
        services: services.map((service) => ({
          id: service.id,
          titleAr: service.titleAr,
          titleEn: service.titleEn,
          description: service.description,
          image: service.image,
          commission: service.commission,
          whatsapp: service.whatsapp,
          categoryId: service.categoryId,
          category: service.category,
        })),
      };
    } catch (error) {
      console.error('Error getting services by provider categories:', error);
      throw new InternalServerErrorException(
        'Error fetching services by provider categories',
      );
    }
  }

  async getCategoryServicesByProviderId(
    providerId: number,
    categoryId: number,
  ) {
    try {
      // First, verify that both provider and category exist
      const [provider, category] = await Promise.all([
        this.prisma.provider.findUnique({
          where: { id: providerId },
          select: { id: true, name: true },
        }),
        this.prisma.category.findUnique({
          where: { id: categoryId },
          select: { id: true, titleAr: true, titleEn: true },
        }),
      ]);

      if (!provider) {
        throw new NotFoundException(`Provider with ID ${providerId} not found`);
      }

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      // Check if provider is registered for this category
      const providerCategory = await this.prisma.providerCategory.findFirst({
        where: {
          providerId: providerId,
          categoryId: categoryId,
          isActive: true,
        },
      });

      if (!providerCategory) {
        throw new BadRequestException(
          `Provider is not registered for category ${categoryId}`,
        );
      }

      // Get all services in the specified category
      const services = await this.prisma.service.findMany({
        where: {
          categoryId: categoryId,
          serviceType: 'NORMAL',
        },
        include: {
          category: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              state: true,
            },
          },
        },
        orderBy: {
          titleEn: 'asc',
        },
      });

      return {
        categoryId: category.id,
        categoryName: category.titleEn || category.titleAr, // Prefer English, fallback to Arabic
        providerId: provider.id,
        providerName: provider.name,
        services: services.map((service) => ({
          id: service.id,
          titleAr: service.titleAr,
          titleEn: service.titleEn,
          description: service.description,
          image: service.image,
          commission: service.commission,
          whatsapp: service.whatsapp,
          categoryId: service.categoryId,
          category: service.category,
        })),
        total: services.length,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error fetching category services by provider',
      );
    }
  }

  async getTopProviders(
    limit: number = 10,
    minRating: number = 0,
    minOrders: number = 0,
    includeUnrated: boolean = true,
    userId?: number,
  ) {
    try {
      let user;
      let where: any = {
        isActive: true,
        onlineStatus: true,
        isVerified: true,
      };
      if (userId) {
        user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        where.state = user.state;
      }

      // Get all active providers with comprehensive data
      const providers = await this.prisma.provider.findMany({
        where,
        include: {
          ratings: {
            select: {
              rating: true,
            },
          },
          orders: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              orderDate: true,
            },
          },
          providerServices: {
            where: {
              isActive: true,
            },
            include: {
              service: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Default ordering by join date
        },
      });

      if (providers.length === 0) {
        return {
          providers: [],
          total: 0,
          summary: {
            topRated: 0,
            active: 0,
            verified: 0,
            new: 0,
          },
          filters: {
            limit,
            minRating,
            minOrders,
            includeUnrated,
          },
        };
      }

      // Process providers with comprehensive scoring
      const processedProviders = providers.map((provider) => {
        // Calculate metrics
        const totalRatings = provider.ratings.length;
        const averageRating =
          totalRatings > 0
            ? Math.round(
                (provider.ratings.reduce((sum, r) => sum + r.rating, 0) /
                  totalRatings) *
                  10,
              ) / 10
            : 0;

        const totalOrders = provider.orders.length;
        const completedOrders = provider.orders.filter(
          (o) => o.status === 'completed',
        ).length;
        const totalRevenue = provider.orders
          .filter((o) => o.status === 'completed')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        const activeServices = provider.providerServices.length;

        // Calculate comprehensive score
        let score = 0;
        let tier: 'top-rated' | 'active' | 'verified' | 'new' = 'new';

        // Rating-based scoring (40% weight)
        if (averageRating > 0) {
          score += (averageRating / 5) * 40;
          if (averageRating >= 4.5 && totalRatings >= 5) {
            tier = 'top-rated';
          } else if (averageRating >= 3.5 && totalRatings >= 3) {
            tier = 'active';
          }
        }

        // Order-based scoring (30% weight)
        if (completedOrders > 0) {
          score += Math.min((completedOrders / 50) * 30, 30); // Cap at 30 points for 50+ orders
          if (tier === 'new' && completedOrders >= 10) {
            tier = 'active';
          }
        }

        // Verification and service scoring (20% weight)
        if (provider.isVerified) {
          score += 20;
          if (tier === 'new') {
            tier = 'verified';
          }
        }

        // Activity and recency scoring (10% weight)
        const daysSinceJoin = Math.floor(
          (Date.now() - provider.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSinceJoin <= 30) {
          score += 10; // Bonus for new providers
        } else if (daysSinceJoin <= 90) {
          score += 5;
        }

        return {
          ...provider,
          averageRating,
          totalRatings,
          totalOrders,
          completedOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          activeServices,
          tier,
          score: Math.round(score * 100) / 100,
        };
      });

      // Apply filters
      let filteredProviders = processedProviders;

      if (minRating > 0) {
        filteredProviders = filteredProviders.filter(
          (p) => p.averageRating >= minRating,
        );
      }

      if (minOrders > 0) {
        filteredProviders = filteredProviders.filter(
          (p) => p.completedOrders >= minOrders,
        );
      }

      if (!includeUnrated) {
        filteredProviders = filteredProviders.filter((p) => p.totalRatings > 0);
      }

      // Multi-tier sorting: top-rated first, then by score, then by other metrics
      filteredProviders.sort((a, b) => {
        // First: tier priority
        const tierPriority = { 'top-rated': 4, active: 3, verified: 2, new: 1 };
        const tierDiff = tierPriority[b.tier] - tierPriority[a.tier];
        if (tierDiff !== 0) return tierDiff;

        // Second: score
        if (b.score !== a.score) return b.score - a.score;

        // Third: rating
        if (b.averageRating !== a.averageRating)
          return b.averageRating - a.averageRating;

        // Fourth: completed orders
        if (b.completedOrders !== a.completedOrders)
          return b.completedOrders - a.completedOrders;

        // Fifth: verification status
        if (b.isVerified !== a.isVerified) return b.isVerified ? 1 : -1;

        // Sixth: join date (newer first)
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      // Apply limit and add ranking
      const limitedProviders = filteredProviders
        .slice(0, limit)
        .map((provider, index) => ({
          ...provider,
          rank: index + 1,
        }));

      // Calculate summary statistics
      const summary = {
        topRated: limitedProviders.filter((p) => p.tier === 'top-rated').length,
        active: limitedProviders.filter((p) => p.tier === 'active').length,
        verified: limitedProviders.filter((p) => p.tier === 'verified').length,
        new: limitedProviders.filter((p) => p.tier === 'new').length,
      };

      return {
        providers: limitedProviders,
        total: limitedProviders.length,
        summary,
        filters: {
          limit,
          minRating,
          minOrders,
          includeUnrated,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching top providers');
    }
  }

  // Phone Number Change Methods
  async requestPhoneChange(
    providerId: number,
    changePhoneDto: ChangePhoneRequestDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { newPhoneNumber } = changePhoneDto;

      // Verify provider exists
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { id: true, phone: true },
      });

      if (!provider) {
        throw new NotFoundException('Provider not found');
      }

      // Check if new phone number is different from current
      if (provider.phone === newPhoneNumber) {
        throw new BadRequestException(
          'New phone number must be different from current phone number',
        );
      }

      // Check if new phone number is already in use by another provider
      const existingProvider = await this.prisma.provider.findFirst({
        where: { phone: newPhoneNumber },
      });

      if (existingProvider) {
        throw new ConflictException(
          'Phone number is already in use by another provider',
        );
      }

      // Check if new phone number is already in use by a user
      const existingUser = await this.prisma.user.findFirst({
        where: { phone: newPhoneNumber },
      });

      if (existingUser) {
        throw new ConflictException('Phone number is already in use by a user');
      }

      // Send OTP to new phone number
      const otpResult = await this.smsService.sendOtp({
        phoneNumber: newPhoneNumber,
        purpose: 'phone_change',
      });

      if (!otpResult.success) {
        throw new BadRequestException(otpResult.message);
      }

      return {
        success: true,
        message: 'OTP sent to new phone number successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error requesting phone change');
    }
  }

  async verifyPhoneChange(
    providerId: number,
    verifyPhoneDto: VerifyPhoneChangeDto,
  ): Promise<PhoneChangeResponseDto> {
    try {
      const { newPhoneNumber, otp } = verifyPhoneDto;

      // Verify provider exists
      const provider = await this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { id: true, phone: true },
      });

      if (!provider) {
        throw new NotFoundException('Provider not found');
      }

      // Verify OTP
      const otpResult = await this.smsService.verifyOtp({
        phoneNumber: newPhoneNumber,
        otp,
        purpose: 'phone_change',
      });

      if (!otpResult.success) {
        throw new BadRequestException(otpResult.message);
      }

      // Update provider's phone number
      await this.prisma.provider.update({
        where: { id: providerId },
        data: { phone: newPhoneNumber },
      });

      return {
        success: true,
        message: 'Phone number changed successfully',
        newPhoneNumber,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error verifying phone change');
    }
  }
}
