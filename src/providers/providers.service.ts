import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll() {
    try {
      return await this.prisma.provider.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Error fetching providers');
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.prisma.provider.findUnique({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException('Error finding provider by email');
    }
  }

  async findByPhone(phone: string) {
    try {
      return await this.prisma.provider.findFirst({ where: { phone } });
    } catch (error) {
      throw new InternalServerErrorException('Error finding provider by phone');
    }
  }

  async findById(id: number) {
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

  async create(data: CreateProviderDto) {
    try {
      return await this.prisma.provider.create({ data });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
              throw new BadRequestException('Provider with this email already exists');
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

  async registerProviderWithServices(data: CreateProviderDto) {
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
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
              throw new BadRequestException('Provider with this email already exists');
            }
            break;
          case 'P2003':
            throw new BadRequestException('Invalid service reference provided');
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException('Error registering provider with services');
    }
  }

  async update(id: number, data: UpdateProviderDto) {
    try {
      const { serviceIds, ...providerData } = data;

      // If serviceIds are provided, update the provider services
      if (serviceIds !== undefined) {
        // First, delete existing provider services
        await this.prisma.providerService.deleteMany({
          where: { providerId: id }
        });

        // Then create new provider services
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
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(`Provider with ID ${id} not found`);
          case 'P2002':
            if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
              throw new BadRequestException('Provider with this email already exists');
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
        include: { providerServices: true }
      });
      return provider;
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

  async addServices(providerId: number, serviceIds: number[]) {
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
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2003':
            throw new BadRequestException('Invalid service reference provided');
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException('Error adding services to provider');
    }
  }

  async removeServices(providerId: number, serviceIds: number[]) {
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
    } catch (error) {
      throw new InternalServerErrorException('Error removing services from provider');
    }
  }

  async getProviderServices(providerId: number) {
    try {
      return await this.prisma.providerService.findMany({
        where: { providerId },
        include: {
          service: true
        }
      });
    } catch (error) {
      throw new InternalServerErrorException('Error fetching provider services');
    }
  }

  async getProviderOrders(providerId: number) {
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
    } catch (error) {
      throw new InternalServerErrorException('Error fetching provider orders');
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
              email: true
            }
          }
        },
        orderBy: {
          ratingDate: 'desc'
        }
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

      // Convert document URLs to document objects with full URLs
      const documents = verification.documents.map((url, index) => {
        // Ensure we have a full URL
        const fullUrl = url.startsWith('http') 
          ? url 
          : `http://localhost:3001${url}`;
        
        return {
          id: `doc-${index}`,
          name: url.split('/').pop() || `Document ${index + 1}`,
          url: fullUrl,
          type: this.getFileTypeFromUrl(url),
          size: 0, // We don't store file size in the database
          uploadedAt: verification.createdAt.toISOString(),
          uploadedBy: 'Admin'
        };
      });

      return {
        documents,
        verificationStatus: verification.status,
        adminNotes: verification.adminNotes
      };
    } catch (error) {
      throw new InternalServerErrorException('Error fetching provider documents');
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
}
