import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateRatingDto {
  providerId: number;
  orderId?: number;
  rating: number;
  comment?: string;
}

export interface UpdateRatingDto {
  rating?: number;
  comment?: string;
}

@Injectable()
export class ProviderRatingsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(userId: number, createRatingDto: CreateRatingDto) {
    const { providerId, orderId, rating, comment } = createRatingDto;

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // If orderId is provided, validate the order
    if (orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.userId !== userId) {
        throw new ForbiddenException('You can only rate orders you placed');
      }

      if (order.providerId !== providerId) {
        throw new BadRequestException('Order does not belong to this provider');
      }

      if (order.status !== 'completed') {
        throw new BadRequestException('You can only rate completed orders');
      }
    }

    // Check if user already rated this provider (for this order or in general)
    const existingRating = await this.prisma.providerRating.findFirst({
      where: {
        userId,
        providerId,
        ...(orderId && { orderId })
      }
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this provider');
    }

    // Create the rating
    const newRating = await this.prisma.providerRating.create({
      data: {
        userId,
        providerId,
        orderId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return newRating;
  }

  async findAll(providerId?: number) {
    const where = providerId ? { providerId } : {};

    const ratings = await this.prisma.providerRating.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        ratingDate: 'desc'
      }
    });

    return ratings;
  }

  async findByProvider(providerId: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const ratings = await this.prisma.providerRating.findMany({
      where: { providerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        ratingDate: 'desc'
      }
    });

    // Calculate average rating
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // Calculate rating distribution
    const ratingDistribution = {
      1: ratings.filter(r => r.rating === 1).length,
      2: ratings.filter(r => r.rating === 2).length,
      3: ratings.filter(r => r.rating === 3).length,
      4: ratings.filter(r => r.rating === 4).length,
      5: ratings.filter(r => r.rating === 5).length
    };

    return {
      provider: {
        id: provider.id,
        name: provider.name,
        image: provider.image
      },
      ratings,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings: ratings.length,
      ratingDistribution
    };
  }

  async findOne(id: number) {
    const rating = await this.prisma.providerRating.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    return rating;
  }

  async update(id: number, userId: number, updateRatingDto: UpdateRatingDto) {
    const rating = await this.prisma.providerRating.findUnique({
      where: { id }
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    const { rating: newRating, comment } = updateRatingDto;

    // Validate rating range if provided
    if (newRating && (newRating < 1 || newRating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const updatedRating = await this.prisma.providerRating.update({
      where: { id },
      data: {
        ...(newRating && { rating: newRating }),
        ...(comment !== undefined && { comment })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return updatedRating;
  }

  async remove(id: number, userId: number) {
    const rating = await this.prisma.providerRating.findUnique({
      where: { id }
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException('You can only delete your own ratings');
    }

    await this.prisma.providerRating.delete({
      where: { id }
    });

    return { message: 'Rating deleted successfully' };
  }

  async getUserRatings(userId: number) {
    const ratings = await this.prisma.providerRating.findMany({
      where: { userId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        ratingDate: 'desc'
      }
    });

    return ratings;
  }

  async getTopRatedProviders(limit: number = 10) {
    const providers = await this.prisma.provider.findMany({
      where: {
        isActive: true,
        isVerified: true
      },
      include: {
        ratings: {
          select: {
            rating: true
          }
        }
      }
    });

    const providersWithRating = providers
      .map(provider => {
        const averageRating = provider.ratings.length > 0
          ? provider.ratings.reduce((sum, r) => sum + r.rating, 0) / provider.ratings.length
          : 0;

        return {
          ...provider,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: provider.ratings.length
        };
      })
      .filter(provider => provider.totalRatings > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);

    return providersWithRating;
  }
}
