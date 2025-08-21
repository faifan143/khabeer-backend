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

      // Group settings by category
      const groupedSettings = systemSettings.reduce((acc: Record<string, Record<string, string>>, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = {};
        }
        acc[setting.category][setting.key] = setting.value;
        return acc;
      }, {});

      // Parse social media links if they exist
      let socialMedia = {};
      if (groupedSettings.social?.social_links) {
        try {
          socialMedia = JSON.parse(groupedSettings.social.social_links);
        } catch (parseError) {
          // If parsing fails, return empty object
          socialMedia = {};
        }
      }

      return {
        user,
        systemInfo: {
          socialMedia,
          legalDocuments: groupedSettings.legal || {},
          support: groupedSettings.support || {}
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
