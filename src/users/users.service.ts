import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  async findByPhone(phone: string) {
    try {
      return await this.prisma.user.findFirst({ where: { phone } });
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
      return await this.prisma.user.create({ data: userData });
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
      return await this.prisma.user.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Error fetching users');
    }
  }

  async findById(id: number) {
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

  async update(id: number, data: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({ where: { id }, data });
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
      await this.prisma.user.delete({ where: { id } });
      return { message: 'User deleted successfully' };
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
          console.log('Parsed social media links:', parsedSocialLinks);
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
      } else {
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
}
