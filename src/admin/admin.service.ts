import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import {
  AdminProviderResponseDto,
  AdminProvidersResponseDto,
} from './dto/admin-provider-response.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalProviders,
        totalOrders,
        totalRevenue,
        pendingVerifications,
        pendingJoinRequests,
        activeUsers,
        activeProviders,
        completedOrders,
        totalCommission,
        // Additional data for dashboard
        popularServices,
        topProviders,
        orderStats,
        // State-specific data
        stateProvidersData,
        stateServicesData,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.provider.count(),
        this.prisma.order.count(),
        this.prisma.invoice.aggregate({
          where: { paymentStatus: 'paid' },
          _sum: { totalAmount: true },
        }),
        this.prisma.providerVerification.count({
          where: { status: 'pending' },
        }),
        this.prisma.providerJoinRequest.count({ where: { status: 'pending' } }),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.provider.count({ where: { isActive: true } }),
        this.prisma.order.count({ where: { status: 'completed' } }),
        this.prisma.order.aggregate({
          where: { status: 'completed' },
          _sum: { commissionAmount: true },
        }),
        // Get popular services with order counts
        this.prisma.service.findMany({
          include: {
            category: true,
            orders: {
              where: { status: 'completed' },
              select: { id: true },
            },
          },
          orderBy: {
            orders: {
              _count: 'desc',
            },
          },
          take: 10,
        }),
        // Get top providers with order counts and ratings
        this.prisma.provider.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            description: true,
            image: true,
            state: true,
            isActive: true,
            isVerified: true,
            orders: {
              where: { status: 'completed' },
              select: { id: true },
            },
            ratings: {
              select: { rating: true },
            },
          },
          orderBy: {
            orders: {
              _count: 'desc',
            },
          },
          take: 10,
        }),
        // Get order statistics
        this.getOrderStats(),
        // Get state-specific providers data
        this.getStateSpecificProviders(),
        // Get state-specific services data
        this.getStateSpecificServices(),
      ]);

      // Process popular services
      const processedPopularServices = popularServices.map((service) => ({
        id: service.id,
        name: service.titleEn,
        description: service.description,
        price: service.commission,
        category: service.category
          ? {
              id: service.category.id,
              name: service.category.titleEn,
            }
          : null,
        orderCount: service.orders.length,
      }));

      // Process top providers
      const processedTopProviders = topProviders.map((provider) => {
        const avgRating =
          provider.ratings.length > 0
            ? provider.ratings.reduce((sum, r) => sum + r.rating, 0) /
              provider.ratings.length
            : 0;

        return {
          id: provider.id,
          name: provider.name,
          email: provider.email || '',
          phone: provider.phone,
          description: provider.description,
          image: provider.image,
          state: provider.state,
          isActive: provider.isActive,
          isVerified: provider.isVerified,
          orderCount: provider.orders.length,
          rating: avgRating,
        };
      });

      return {
        overview: {
          totalUsers,
          totalProviders,
          totalOrders,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          totalCommission: totalCommission._sum.commissionAmount || 0,
        },
        pending: {
          verifications: pendingVerifications,
          joinRequests: pendingJoinRequests,
        },
        active: {
          users: activeUsers,
          providers: activeProviders,
          completedOrders,
        },
        // Include all the additional data
        popularServices: processedPopularServices,
        topProviders: processedTopProviders,
        orderStats,
        // State-specific data
        stateBreakdown: {
          providers: stateProvidersData,
          services: stateServicesData,
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values in case of error
      return {
        overview: {
          totalUsers: 0,
          totalProviders: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalCommission: 0,
        },
        pending: {
          verifications: 0,
          joinRequests: 0,
        },
        active: {
          users: 0,
          providers: 0,
          completedOrders: 0,
        },
        popularServices: [],
        topProviders: [],
        orderStats: {
          total: 0,
          today: 0,
          yesterday: 0,
          thisWeek: 0,
          thisMonth: 0,
          byStatus: [],
        },
        stateBreakdown: {
          providers: [],
          services: [],
        },
      };
    }
  }

  async getOverviewStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [newUsers, newProviders, newOrders, newRevenue] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.provider.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.order.count({
        where: { orderDate: { gte: startDate } },
      }),
      this.prisma.invoice.aggregate({
        where: {
          paymentStatus: 'paid',
          paymentDate: { gte: startDate },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      period: `${days} days`,
      newUsers,
      newProviders,
      newOrders,
      newRevenue: newRevenue._sum.totalAmount || 0,
    };
  }

  async getRevenueStats(startDate?: Date, endDate?: Date) {
    const where: any = { paymentStatus: 'paid' };
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = startDate;
      if (endDate) where.paymentDate.lte = endDate;
    }

    const revenue = await this.prisma.invoice.aggregate({
      where,
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const commission = await this.prisma.order.aggregate({
      where: {
        status: 'completed',
        orderDate:
          startDate || endDate
            ? {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              }
            : undefined,
      },
      _sum: { commissionAmount: true },
    });

    return {
      totalRevenue: revenue._sum.totalAmount || 0,
      totalTransactions: revenue._count.id,
      totalCommission: commission._sum.commissionAmount || 0,
      netRevenue:
        (revenue._sum.totalAmount || 0) -
        (commission._sum.commissionAmount || 0),
    };
  }

  async getUserStats() {
    const [total, active, inactive] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: false } }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }

  async getProviderStats() {
    const [total, active, inactive, verified, unverified, topProviders] =
      await Promise.all([
        this.prisma.provider.count(),
        this.prisma.provider.count({ where: { isActive: true } }),
        this.prisma.provider.count({ where: { isActive: false } }),
        this.prisma.provider.count({ where: { isVerified: true } }),
        this.prisma.provider.count({ where: { isVerified: false } }),
        this.prisma.provider.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            description: true,
            image: true,
            state: true,
            isActive: true,
            isVerified: true,
            orders: {
              where: { status: 'completed' },
            },
            ratings: {
              select: {
                rating: true,
              },
            },
          },
          take: 10,
          orderBy: {
            orders: {
              _count: 'desc',
            },
          },
        }),
      ]);

    const providersWithStats = topProviders
      .map((provider) => {
        const avgRating =
          provider.ratings.length > 0
            ? provider.ratings.reduce((sum, r) => sum + r.rating, 0) /
              provider.ratings.length
            : 0;

        return {
          id: provider.id,
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          description: provider.description,
          image: provider.image,
          state: provider.state,
          isActive: provider.isActive,
          isVerified: provider.isVerified,
          orderCount: provider.orders.length,
          rating: avgRating,
        };
      })
      .sort((a, b) => b.orderCount - a.orderCount);

    return {
      total,
      active,
      inactive,
      verified,
      unverified,
      topProviders: providersWithStats,
    };
  }

  async getOrderStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const [
      total,
      completed,
      pending,
      inProgress,
      cancelled,
      todayOrders,
      yesterdayOrders,
      thisWeekOrders,
      thisMonthOrders,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'completed' } }),
      this.prisma.order.count({ where: { status: 'pending' } }),
      this.prisma.order.count({ where: { status: 'in_progress' } }),
      this.prisma.order.count({ where: { status: 'cancelled' } }),
      this.prisma.order.count({ where: { orderDate: { gte: today } } }),
      this.prisma.order.count({
        where: { orderDate: { gte: yesterday, lt: today } },
      }),
      this.prisma.order.count({ where: { orderDate: { gte: thisWeek } } }),
      this.prisma.order.count({ where: { orderDate: { gte: thisMonth } } }),
    ]);

    return {
      total,
      today: todayOrders,
      yesterday: yesterdayOrders,
      thisWeek: thisWeekOrders,
      thisMonth: thisMonthOrders,
      byStatus: [
        { status: 'completed', count: completed },
        { status: 'pending', count: pending },
        { status: 'in_progress', count: inProgress },
        { status: 'cancelled', count: cancelled },
      ],
    };
  }

  async getServiceStats() {
    const [total, popularServices] = await Promise.all([
      this.prisma.service.count(),
      this.prisma.service.findMany({
        include: {
          category: true,
          orders: {
            where: { status: 'completed' },
          },
        },
        take: 10,
      }),
    ]);

    return {
      total,
      popularServices: popularServices
        .map((service) => ({
          ...service,
          orderCount: service.orders.length,
        }))
        .sort((a, b) => b.orderCount - a.orderCount),
    };
  }

  async getPendingVerifications() {
    return this.prisma.providerVerification.findMany({
      where: { status: 'pending' },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            phone: true,
            description: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPendingJoinRequests() {
    // Return unverified providers that are not rejected
    return this.prisma.provider.findMany({
      where: {
        isVerified: false,
        OR: [
          {
            verification: {
              status: 'pending',
            },
          },
          {
            verification: null, // Providers without verification record
          },
        ],
      },
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
        joinRequests: {
          where: { status: 'pending' },
          select: {
            id: true,
            status: true,
            requestDate: true,
            adminNotes: true,
          },
        },
        verification: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            adminNotes: true,
          },
        },
        _count: {
          select: {
            providerServices: true,
            orders: true,
            ratings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActualPendingJoinRequests() {
    // Get actual pending join requests for the join requests table
    return this.prisma.providerJoinRequest.findMany({
      where: { status: 'pending' },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            description: true,
            image: true,
            isVerified: true,
            isActive: true,
            providerServices: {
              include: {
                service: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { requestDate: 'asc' },
    });
  }

  async getAllProviders(): Promise<AdminProvidersResponseDto> {
    const providers = await this.prisma.provider.findMany({
      where: { isVerified: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        description: true,
        image: true,
        state: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        fcm: true,
        providerServices: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        orders: {
          where: {
            status: {
              in: ['pending', 'accepted', 'in_progress', 'completed'],
            },
          },
          select: {
            id: true,
            status: true,
            orderDate: true,
            commissionAmount: true,
            providerAmount: true,
            providerNetAmount: true,
            totalAmount: true,
          },
        },
        offers: {
          where: { isActive: true },
          select: {
            id: true,
            originalPrice: true,
            offerPrice: true,
          },
        },
        _count: {
          select: {
            orders: true,
            providerServices: true,
            ratings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate commission and order statistics for each provider
    const providersWithCommission = providers.map((provider) => {
      const completedOrders = provider.orders.filter(
        (order) => order.status === 'completed',
      );
      const pendingOrders = provider.orders.filter(
        (order) => order.status === 'pending',
      );
      const acceptedOrders = provider.orders.filter(
        (order) => order.status === 'accepted',
      );
      const inProgressOrders = provider.orders.filter(
        (order) => order.status === 'in_progress',
      );

      const totalCommission = completedOrders.reduce(
        (sum, order) => sum + order.commissionAmount,
        0,
      );
      const totalEarnings = completedOrders.reduce(
        (sum, order) => sum + order.providerAmount,
        0,
      );
      const totalNetEarnings = completedOrders.reduce(
        (sum, order) => sum + order.providerNetAmount,
        0,
      );

      return {
        ...provider,
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        totalNetEarnings: Math.round(totalNetEarnings * 100) / 100,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        acceptedOrders: acceptedOrders.length,
        inProgressOrders: inProgressOrders.length,
        offeredOrders: pendingOrders.length + acceptedOrders.length, // Orders that are "offered" (pending + accepted)
      } as AdminProviderResponseDto;
    });

    return {
      providers: providersWithCommission,
      total: providersWithCommission.length,
    };
  }

  async getUnverifiedProviders() {
    return this.prisma.provider.findMany({
      where: {
        isVerified: false,
        OR: [
          {
            verification: {
              status: 'pending',
            },
          },
          {
            verification: null, // Providers without verification record
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        description: true,
        image: true,
        state: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        providerServices: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
        verification: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            adminNotes: true,
          },
        },
        _count: {
          select: {
            providerServices: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveVerification(id: string, notes?: string) {
    const verification = await this.prisma.providerVerification.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    if (verification.status !== 'pending') {
      throw new BadRequestException('Verification is not pending');
    }

    await this.prisma.$transaction([
      this.prisma.providerVerification.update({
        where: { id },
        data: {
          status: 'approved',
          adminNotes: notes,
          updatedAt: new Date(),
        },
      }),
      this.prisma.provider.update({
        where: { id: verification.providerId },
        data: { isVerified: true },
      }),
    ]);

    return { message: 'Verification approved successfully' };
  }

  async rejectVerification(id: string, notes: string) {
    const verification = await this.prisma.providerVerification.findUnique({
      where: { id },
    });

    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    if (verification.status !== 'pending') {
      throw new BadRequestException('Verification is not pending');
    }

    await this.prisma.providerVerification.update({
      where: { id },
      data: {
        status: 'rejected',
        adminNotes: notes,
        updatedAt: new Date(),
      },
    });

    return { message: 'Verification rejected successfully' };
  }

  async approveJoinRequest(id: number, notes?: string) {
    const joinRequest = await this.prisma.providerJoinRequest.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== 'pending') {
      throw new BadRequestException('Join request is not pending');
    }

    await this.prisma.providerJoinRequest.update({
      where: { id },
      data: {
        status: 'approved',
        adminNotes: notes,
      },
    });

    return { message: 'Join request approved successfully' };
  }

  async rejectJoinRequest(id: number, notes: string) {
    const joinRequest = await this.prisma.providerJoinRequest.findUnique({
      where: { id },
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    if (joinRequest.status !== 'pending') {
      throw new BadRequestException('Join request is not pending');
    }

    await this.prisma.providerJoinRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        adminNotes: notes,
      },
    });

    return { message: 'Join request rejected successfully' };
  }

  async activateUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return { message: 'User activated successfully' };
  }

  async deactivateUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  // Get all ratings for admin
  async getAllRatings() {
    const ratings = await this.prisma.providerRating.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            image: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        ratingDate: 'desc',
      },
    });

    // Get order details for ratings that have orderId
    const ratingsWithOrders = await Promise.all(
      ratings.map(async (rating) => {
        if (rating.orderId) {
          const order = await this.prisma.order.findUnique({
            where: { id: rating.orderId },
            select: {
              id: true,
              bookingId: true,
              totalAmount: true,
              service: {
                select: {
                  id: true,
                  titleAr: true,
                  titleEn: true,
                  category: {
                    select: {
                      id: true,
                      titleEn: true,
                      titleAr: true,
                    },
                  },
                },
              },
            },
          });
          return { ...rating, order };
        }
        return { ...rating, order: null };
      }),
    );

    return ratingsWithOrders;
  }

  async activateProvider(id: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    await this.prisma.provider.update({
      where: { id },
      data: { isActive: true },
    });

    return { message: 'Provider activated successfully' };
  }

  async deactivateProvider(id: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    await this.prisma.provider.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Provider deactivated successfully' };
  }

  async verifyProvider(id: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (provider.isVerified) {
      throw new BadRequestException('Provider is already verified');
    }

    await this.prisma.provider.update({
      where: { id },
      data: { isVerified: true },
    });

    return {
      message: 'Provider verified successfully. Provider can now login.',
      provider: {
        id: provider.id,
        name: provider.name,
        email: provider.email,
      },
    };
  }

  async unverifyProvider(id: number) {
    const provider = await this.prisma.provider.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Update both provider verification status and verification record
    await this.prisma.$transaction([
      this.prisma.provider.update({
        where: { id },
        data: { isVerified: false },
      }),
      this.prisma.providerVerification.upsert({
        where: { providerId: id },
        update: {
          status: 'rejected',
          updatedAt: new Date(),
        },
        create: {
          providerId: id,
          status: 'rejected',
          documents: [],
        },
      }),
    ]);

    return { message: 'Provider verification removed successfully' };
  }

  async getOrderReport(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = startDate;
      if (endDate) where.orderDate.lte = endDate;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        provider: {
          select: { id: true, name: true, phone: true },
        },
        service: {
          select: { id: true, titleAr: true, titleEn: true, commission: true },
        },
        invoice: true,
      },
      orderBy: { orderDate: 'desc' },
    });

    return orders.map((order) => ({
      orderId: order.id,
      bookingId: order.bookingId,
      status: order.status,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount,
      commissionAmount: order.commissionAmount,
      user: order.user,
      provider: order.provider,
      service: order.service,
      paymentStatus: order.invoice?.paymentStatus,
    }));
  }

  async getRevenueReport(startDate?: Date, endDate?: Date) {
    const where: any = { paymentStatus: 'paid' };
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = startDate;
      if (endDate) where.paymentDate.lte = endDate;
    }

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        order: {
          include: {
            user: { select: { name: true, email: true } },
            provider: { select: { name: true, phone: true } },
            service: {
              select: { titleAr: true, titleEn: true, commission: true },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return invoices.map((invoice) => ({
      invoiceId: invoice.id,
      orderId: invoice.order.id,
      paymentDate: invoice.paymentDate,
      totalAmount: invoice.totalAmount,
      discount: invoice.discount,
      netAmount: invoice.totalAmount - invoice.discount,
      commission: invoice.order.commissionAmount,
      user: invoice.order.user,
      provider: invoice.order.provider,
      service: invoice.order.service,
    }));
  }

  async getProviderReport(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const providers = await this.prisma.provider.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        providerServices: {
          include: {
            service: { select: { titleAr: true, titleEn: true } },
          },
        },
        orders: {
          where: { status: 'completed' },
          select: { id: true },
        },
        ratings: {
          select: { rating: true },
        },
        verification: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return providers.map((provider) => ({
      providerId: provider.id,
      name: provider.name,
      phone: provider.phone,
      isActive: provider.isActive,
      isVerified: provider.isVerified,
      createdAt: provider.createdAt,
      services: provider.providerServices.length,
      completedOrders: provider.orders.length,
      averageRating:
        provider.ratings.length > 0
          ? provider.ratings.reduce((sum, r) => sum + r.rating, 0) /
            provider.ratings.length
          : 0,
      verificationStatus: provider.verification?.status || 'none',
    }));
  }

  async getUserReport(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        address: true,
        state: true,
        image: true,
        orders: {
          where: { status: 'completed' },
          select: { totalAmount: true },
        },
        ratings: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      completedOrders: user.orders.length,
      totalSpent: user.orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      ),
      ratingsGiven: user.ratings.length,
      address: user.address,
      state: user.state,
      image: user.image,
    }));
  }

  // Payment verification methods

  // Admin Orders Management Methods
  async getAllOrders(page: number = 1, limit: number = 1000) {
    const skip = (page - 1) * limit;

    const orders = await this.prisma.order.findMany({
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        provider: {
          select: { id: true, name: true, email: true, phone: true },
        },
        service: {
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            description: true,
            commission: true,
            category: {
              select: {
                state: true,
              },
            },
          },
        },
        invoice: true,
      },
      orderBy: { orderDate: 'desc' },
    });

    const total = await this.prisma.order.count();

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateOrderStatus(id: number, status: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        provider: { select: { name: true, email: true } },
        service: { select: { titleAr: true, titleEn: true } },
      },
    });

    return { message: 'Order status updated successfully', order };
  }

  async cancelOrder(id: number, reason?: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        // You might want to store the cancellation reason in a separate table
      },
      include: {
        user: { select: { name: true, email: true } },
        provider: { select: { name: true, email: true } },
        service: { select: { titleAr: true, titleEn: true } },
      },
    });

    return { message: 'Order cancelled successfully', order };
  }

  async completeOrder(id: number) {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: 'completed' },
      include: {
        user: { select: { name: true, email: true } },
        provider: { select: { name: true, email: true } },
        service: { select: { titleAr: true, titleEn: true } },
      },
    });

    return { message: 'Order completed successfully', order };
  }

  async acceptOrder(id: number, notes?: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'accepted',
        // You might want to store admin notes in a separate table
      },
      include: {
        user: { select: { name: true, email: true } },
        provider: { select: { name: true, email: true } },
        service: { select: { titleAr: true, titleEn: true } },
      },
    });

    return { message: 'Order accepted successfully', order };
  }

  async rejectOrder(id: number, reason: string) {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        // You might want to store the rejection reason in a separate table
      },
      include: {
        user: { select: { name: true, email: true } },
        provider: { select: { name: true, email: true } },
        service: { select: { titleAr: true, titleEn: true } },
      },
    });

    return { message: 'Order rejected successfully', order };
  }

  // Settings Methods
  async getSystemSettings(category?: string) {
    try {
      const where = category ? { category } : {};
      const settings = await this.prisma.systemSettings.findMany({
        where,
        orderBy: { category: 'asc' },
      });

      // Group settings by category
      const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
      }, {});

      return groupedSettings;
    } catch (error) {
      throw error;
    }
  }

  async getTermsAndConditions() {
    const terms = await this.prisma.systemSettings.findMany({
      where: { key: { in: ['terms_en', 'terms_ar'] } },
    });

    // Convert to object format for easier access
    const termsObject: { [key: string]: string } = {};
    terms.forEach((term) => {
      termsObject[term.key] = term.value;
    });

    return {
      terms_en: termsObject.terms_en || null,
      terms_ar: termsObject.terms_ar || null,
    };
  }

  async uploadTermsFile(language: 'en' | 'ar', fileUrl: string) {
    const key = `terms_${language}`;
    const description = `Terms and Conditions - ${language === 'en' ? 'English' : 'Arabic'} Version`;

    return this.updateSystemSetting(key, fileUrl, description, 'legal');
  }

  async updateSystemSetting(
    key: string,
    value: string,
    description?: string,
    category: string = 'general',
  ) {
    try {
      const setting = await this.prisma.systemSettings.upsert({
        where: { key },
        update: {
          value,
          description,
          category,
          updatedAt: new Date(),
        },
        create: {
          key,
          value,
          description,
          category,
        },
      });

      return setting;
    } catch (error) {
      throw error;
    }
  }

  async getSubAdmins() {
    try {
      const subAdmins = await this.prisma.subAdmin.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return subAdmins.map((admin) => ({
        ...admin,
        permissions: JSON.parse(admin.permissions as string),
      }));
    } catch (error) {
      throw error;
    }
  }

  async createSubAdmin(
    name: string,
    email: string,
    password: string,
    permissions: string[],
  ) {
    try {
      // Check if email already exists
      const existingAdmin = await this.prisma.subAdmin.findUnique({
        where: { email },
      });

      if (existingAdmin) {
        throw new BadRequestException('Email already exists');
      }

      // Hash password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      const subAdmin = await this.prisma.subAdmin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          permissions: JSON.stringify(permissions),
        },
      });

      return {
        ...subAdmin,
        permissions: JSON.parse(subAdmin.permissions as string),
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteSubAdmin(id: number) {
    try {
      const subAdmin = await this.prisma.subAdmin.findUnique({
        where: { id },
      });

      if (!subAdmin) {
        throw new NotFoundException('Sub-admin not found');
      }

      await this.prisma.subAdmin.delete({
        where: { id },
      });

      return { message: 'Sub-admin deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async getAdBanners() {
    try {
      const banners = await this.prisma.adBanner.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return banners;
    } catch (error) {
      throw error;
    }
  }

  async getActiveAdBanners(limit: number = 10) {
    try {
      const banners = await this.prisma.adBanner.findMany({
        where: {
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return banners;
    } catch (error) {
      throw error;
    }
  }

  async getFeaturedBanners() {
    try {
      const banners = await this.prisma.adBanner.findMany({
        where: {
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      return banners;
    } catch (error) {
      throw error;
    }
  }

  async createAdBanner(data: {
    title: string;
    description: string;
    imageUrl?: string;
    linkType: string;
    externalLink?: string;
    providerId?: number;
    isActive: boolean | string;
  }) {
    try {
      // Convert string values to proper types
      const createData: any = { ...data };

      // Convert isActive from string to boolean
      if (typeof createData.isActive === 'string') {
        createData.isActive = createData.isActive === 'true';
      }

      // Convert providerId from string to number if present
      if (createData.providerId && typeof createData.providerId === 'string') {
        createData.providerId = parseInt(createData.providerId, 10);
      }

      const banner = await this.prisma.adBanner.create({
        data: createData,
      });

      return banner;
    } catch (error) {
      throw error;
    }
  }

  async updateAdBanner(
    id: number,
    data: {
      title?: string;
      description?: string;
      imageUrl?: string;
      linkType?: string;
      externalLink?: string;
      providerId?: number;
      isActive?: boolean | string;
    },
  ) {
    try {
      const banner = await this.prisma.adBanner.findUnique({
        where: { id },
      });

      if (!banner) {
        throw new NotFoundException('Ad banner not found');
      }

      // Convert string values to proper types
      const updateData: any = { ...data };

      // Convert isActive from string to boolean
      if (typeof updateData.isActive === 'string') {
        updateData.isActive = updateData.isActive === 'true';
      }

      // Convert providerId from string to number if present
      if (updateData.providerId && typeof updateData.providerId === 'string') {
        updateData.providerId = parseInt(updateData.providerId, 10);
      }

      const updatedBanner = await this.prisma.adBanner.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      return updatedBanner;
    } catch (error) {
      throw error;
    }
  }

  async deleteAdBanner(id: number) {
    try {
      const banner = await this.prisma.adBanner.findUnique({
        where: { id },
      });

      if (!banner) {
        throw new NotFoundException('Ad banner not found');
      }

      await this.prisma.adBanner.delete({
        where: { id },
      });

      return { message: 'Ad banner deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Notification Methods
  async getAllNotifications() {
    try {
      const notifications = await this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return notifications.map((notification) => ({
        ...notification,
        targetAudience: notification.targetAudience, // Already an object, no need to parse
      }));
    } catch (error) {
      console.error('Error in getAllNotifications:', error);
      throw new Error(`Failed to retrieve notifications: ${error.message}`);
    }
  }

  async createNotification(data: {
    title: string;
    imageUrl?: string;
    targetAudience: string[];
  }) {
    try {
      // Use the notifications service to create and immediately send
      const result = await this.notificationsService.createNotification({
        title: data.title,
        imageUrl: data.imageUrl,
        targetAudience: data.targetAudience as any,
        notificationType: NotificationType.GENERAL,
        data: {},
      });

      return {
        ...result,
        targetAudience: result.targetAudience,
      };
    } catch (error) {
      throw error;
    }
  }

  async sendNotification(id: number) {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      // Here you would implement the actual sending logic
      // For now, we'll just update the status
      const updatedNotification = await this.prisma.notification.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          recipientsCount: 1000, // Mock count - replace with actual logic
        },
      });

      return {
        ...updatedNotification,
        targetAudience: updatedNotification.targetAudience, // Already an object, no need to parse
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteNotification(id: number) {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      await this.prisma.notification.delete({
        where: { id },
      });

      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Invoice management methods
  async getAllInvoices(status?: string, startDate?: Date, endDate?: Date) {
    try {
      const where: any = {};

      if (status) {
        where.paymentStatus = status;
      }

      if (startDate || endDate) {
        where.order = {
          orderDate: {},
        };
        if (startDate) where.order.orderDate.gte = startDate;
        if (endDate) where.order.orderDate.lte = endDate;
      }

      const invoices = await this.prisma.invoice.findMany({
        where,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
                },
              },
              provider: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
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
        },
        orderBy: { orderId: 'desc' },
      });

      return invoices.map((invoice) => ({
        id: invoice.id,
        orderId: invoice.orderId,
        totalAmount: invoice.totalAmount,
        discount: invoice.discount,
        netAmount: invoice.totalAmount - invoice.discount,
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentMethod,
        order: invoice.order,
        paymentDate: invoice.paymentDate,
      }));
    } catch (error) {
      throw error;
    }
  }

  async getInvoice(id: number) {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
                },
              },
              provider: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  email: true,
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
        },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      return {
        id: invoice.id,
        orderId: invoice.orderId,
        totalAmount: invoice.totalAmount,
        discount: invoice.discount,
        netAmount: invoice.totalAmount - invoice.discount,
        paymentStatus: invoice.paymentStatus,
        paymentMethod: invoice.paymentMethod,
        paymentDate: invoice.paymentDate,
        order: invoice.order,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateInvoicePaymentStatus(
    id: number,
    data: {
      paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
      paymentMethod?: string;
    },
  ) {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      const updateData: any = {
        paymentStatus: data.paymentStatus,
      };

      if (data.paymentMethod) {
        updateData.paymentMethod = data.paymentMethod;
      }

      if (data.paymentStatus === 'paid') {
        updateData.paymentDate = new Date();
      }

      const updatedInvoice = await this.prisma.invoice.update({
        where: { id },
        data: updateData,
        include: {
          order: {
            include: {
              user: true,
              provider: true,
              service: true,
            },
          },
        },
      });

      return updatedInvoice;
    } catch (error) {
      throw error;
    }
  }

  async markInvoiceAsPaid(id: number, paymentMethod?: string) {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
      });

      if (!invoice) {
        throw new NotFoundException('Invoice not found');
      }

      const updatedInvoice = await this.prisma.invoice.update({
        where: { id },
        data: {
          paymentStatus: 'paid',
          paymentMethod: paymentMethod || 'admin_manual',
          paymentDate: new Date(),
        },
        include: {
          order: {
            include: {
              user: true,
              provider: true,
              service: true,
            },
          },
        },
      });

      return updatedInvoice;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get top 5 providers for each state
   */
  async getStateSpecificProviders() {
    try {
      // Get all unique states from providers
      const states = await this.prisma.provider.findMany({
        select: { state: true },
        distinct: ['state'],
        where: { isActive: true },
      });

      const stateProvidersData: any[] = [];

      for (const { state } of states) {
        const providers = await this.prisma.provider.findMany({
          where: {
            state,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            description: true,
            image: true,
            state: true,
            isActive: true,
            isVerified: true,
            orders: {
              where: { status: 'completed' },
              select: { id: true },
            },
            ratings: {
              select: { rating: true },
            },
          },
          orderBy: {
            orders: {
              _count: 'desc',
            },
          },
          take: 5,
        });

        const processedProviders = providers.map((provider) => {
          const avgRating =
            provider.ratings.length > 0
              ? provider.ratings.reduce((sum, r) => sum + r.rating, 0) /
                provider.ratings.length
              : 0;

          return {
            id: provider.id,
            name: provider.name,
            email: provider.email || '',
            phone: provider.phone,
            description: provider.description,
            image: provider.image,
            state: provider.state,
            isActive: provider.isActive,
            isVerified: provider.isVerified,
            orderCount: provider.orders.length,
            rating: avgRating,
          };
        });

        stateProvidersData.push({
          state,
          providers: processedProviders,
        });
      }

      return stateProvidersData;
    } catch (error) {
      console.error('Error fetching state-specific providers:', error);
      return [];
    }
  }

  /**
   * Get top 5 popular services for each state
   */
  async getStateSpecificServices() {
    try {
      // Get all unique states from services (through categories)
      const states = await this.prisma.category.findMany({
        select: { state: true },
        distinct: ['state'],
      });

      const stateServicesData: any[] = [];

      for (const { state } of states) {
        const services = await this.prisma.service.findMany({
          where: {
            category: {
              state,
            },
          },
          include: {
            category: true,
            orders: {
              where: { status: 'completed' },
              select: { id: true },
            },
          },
          orderBy: {
            orders: {
              _count: 'desc',
            },
          },
          take: 5,
        });

        const processedServices = services.map((service) => ({
          id: service.id,
          name: service.titleEn,
          description: service.description,
          price: service.commission,
          category: service.category
            ? {
                id: service.category.id,
                name: service.category.titleEn,
              }
            : null,
          orderCount: service.orders.length,
        }));

        stateServicesData.push({
          state,
          services: processedServices,
        });
      }

      return stateServicesData;
    } catch (error) {
      console.error('Error fetching state-specific services:', error);
      return [];
    }
  }
}
