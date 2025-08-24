import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserLocationDto } from './dto/create-user-location.dto';
import { UpdateUserLocationDto } from './dto/update-user-location.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  // Internal methods for authentication (return passwords)
  async findByEmailWithPassword(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  async findByPhoneWithPassword(phone: string) {
    try {
      return await this.prisma.user.findFirst({ where: { phone } });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by phone');
    }
  }

  async findByIdWithPassword(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error finding user');
    }
  }

  // Public methods (no passwords)
  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          image: true,
          state: true,
          phone: true,
          isActive: true,
          officialDocuments: true,
          createdAt: true,
          email: true,
          updatedAt: true,
          address: true,
          role: true,
          latitude: true,
          longitude: true,
          fcm: true
        }
      });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  async findByPhone(phone: string) {
    try {
      return await this.prisma.user.findFirst({
        where: { phone },
        select: {
          id: true,
          name: true,
          image: true,
          state: true,
          phone: true,
          isActive: true,
          officialDocuments: true,
          createdAt: true,
          email: true,
          updatedAt: true,
          address: true,
          role: true,
          latitude: true,
          longitude: true,
          fcm: true
        }
      });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by phone');
    }
  }

  async create(data: CreateUserDto) {
    try {
      // Ensure required fields have default values
      const userData = {
        ...data,
        image: data.image || '',
        address: data.address || '',
        phone: data.phone || '',
        state: data.state || '',
        isActive: data.isActive ?? true
      };
      const user = await this.prisma.user.create({ data: userData });

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2002':
            if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
              throw new BadRequestException('User with this email already exists');
            }
            break;
          case 'P2003':
            throw new BadRequestException('Invalid reference data provided');
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          state: true,
          phone: true,
          isActive: true,
          officialDocuments: true,
          createdAt: true,
          email: true,
          updatedAt: true,
          address: true,
          role: true,
          latitude: true,
          longitude: true,
          fcm: true
        }
      });
      return users;
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users');
    }
  }

  async findById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          image: true,
          state: true,
          phone: true,
          isActive: true,
          officialDocuments: true,
          createdAt: true,
          email: true,
          updatedAt: true,
          address: true,
          role: true,
          latitude: true,
          longitude: true,
          fcm: true
        }
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error finding user');
    }
  }

  async update(id: number, data: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          image: true,
          state: true,
          phone: true,
          isActive: true,
          officialDocuments: true,
          createdAt: true,
          email: true,
          updatedAt: true,
          address: true,
          role: true,
          latitude: true,
          longitude: true,
          fcm: true
        }
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(`User with ID ${id} not found`);
          case 'P2002':
            if (error.meta?.target && Array.isArray(error.meta.target) && error.meta.target.includes('email')) {
              throw new BadRequestException('User with this email already exists');
            }
            break;
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async remove(id: number) {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          image: true,
          state: true,
          phone: true,
          isActive: true,
          officialDocuments: true,
          createdAt: true,
          email: true,
          updatedAt: true,
          address: true,
          role: true,
          latitude: true,
          longitude: true,
          fcm: true
        }
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(`User with ID ${id} not found`);
          default:
            throw new InternalServerErrorException('Database operation failed');
        }
      }
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  // Debug methods
  async testDatabaseConnection() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async getDatabaseStats() {
    try {
      const userCount = await this.prisma.user.count();
      const locationCount = await this.prisma.userLocation.count();
      const providerCount = await this.prisma.provider.count();

      return {
        userCount,
        locationCount,
        providerCount
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  async getProfile(userId: number) {
    try {
      // Get user information
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
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Get system settings for social media, legal documents, and support
      const systemSettings = await this.prisma.systemSettings.findMany({
        where: {
          category: {
            in: ['social', 'legal', 'support']
          }
        }
      });

      // Group settings by category and map to expected field names
      const groupedSettings = systemSettings.reduce((acc: Record<string, Record<string, string>>, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = {};
        }
        acc[setting.category][setting.key] = setting.value;
        return acc;
      }, {});

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
          const parsedSocialLinks = JSON.parse(groupedSettings.social.social_links);
          socialMedia = {
            whatsapp: parsedSocialLinks.whatsapp || null,
            instagram: parsedSocialLinks.instagram || null,
            facebook: parsedSocialLinks.facebook || null,
            tiktok: parsedSocialLinks.tiktok || null,
            snapchat: parsedSocialLinks.snapchat || null,
          };
        } catch (parseError) {
          console.error('Failed to parse social media links:', parseError);
          console.error('Raw social_links value:', groupedSettings.social.social_links);
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
        user,
        systemInfo: {
          socialMedia,
          legalDocuments,
          support
        }
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching user profile');
    }
  }

  async updateFCMToken(userId: number, fcmToken: string): Promise<any> {
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
    } catch (error) {
      throw new Error(`Failed to update FCM token for user ${userId}: ${error.message}`);
    }
  }

  async removeFCMToken(userId: number): Promise<any> {
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
    } catch (error) {
      throw new Error(`Failed to remove FCM token for user ${userId}: ${error.message}`);
    }
  }

  // User Location Management Methods
  async getUserLocations(userId: number) {


    try {
      // First, verify the user exists
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, phone: true, role: true }
      });

      if (!userExists) {
        console.error('ERROR: User not found in database with ID:', userId);
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const locations = await this.prisma.userLocation.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' }
        ]
      });

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

      return mappedLocations;
    } catch (error) {
      console.error('ERROR in getUserLocations service method:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(`Error fetching user locations: ${error.message}`);
    }
  }

  async createUserLocation(userId: number, createLocationDto: CreateUserLocationDto) {
    try {
      // If this is the first location or marked as default, set it as default
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
    } catch (error) {
      throw new InternalServerErrorException('Error creating user location');
    }
  }

  async updateUserLocation(userId: number, locationId: number, updateLocationDto: UpdateUserLocationDto) {
    try {
      // Verify the location belongs to the user
      const existingLocation = await this.prisma.userLocation.findFirst({
        where: { id: locationId, userId }
      });

      if (!existingLocation) {
        throw new NotFoundException('Location not found or access denied');
      }

      // If setting as default, unset other defaults
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating user location');
    }
  }

  async deleteUserLocation(userId: number, locationId: number) {
    try {
      // Verify the location belongs to the user
      const existingLocation = await this.prisma.userLocation.findFirst({
        where: { id: locationId, userId }
      });

      if (!existingLocation) {
        throw new NotFoundException('Location not found or access denied');
      }

      // If deleting the default location, set another as default
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting user location');
    }
  }

  async setDefaultLocation(userId: number, locationId: number) {
    try {
      // Verify the location belongs to the user
      const existingLocation = await this.prisma.userLocation.findFirst({
        where: { id: locationId, userId }
      });

      if (!existingLocation) {
        throw new NotFoundException('Location not found or access denied');
      }

      // Unset all other defaults
      await this.prisma.userLocation.updateMany({
        where: { userId },
        data: { isDefault: false }
      });

      // Set this location as default
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error setting default location');
    }
  }
}
