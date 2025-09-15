import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActiveStatusGuard implements CanActivate {
    constructor(private prismaService: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // If no user is authenticated, let other guards handle it
        if (!user) {
            return true;
        }

        // Admin users are always considered active - skip all status checks
        if (user.role === 'ADMIN') {
            return true;
        }

        try {
            // Check if user is a regular user
            if (user.role === 'USER') {
                const userRecord = await this.prismaService.user.findUnique({
                    where: { id: user.userId },
                    select: { isActive: true, role: true }
                });

                if (!userRecord) {
                    throw new UnauthorizedException('User account not found');
                }

                if (!userRecord.isActive) {
                    throw new ForbiddenException('Your account is inactive. Please contact support to reactivate your account.');
                }
            }

            // Check if user is a provider
            if (user.role === 'PROVIDER') {
                const providerRecord = await this.prismaService.provider.findUnique({
                    where: { id: user.userId },
                    select: { isActive: true, isVerified: true }
                });

                if (!providerRecord) {
                    throw new UnauthorizedException('Provider account not found');
                }

                if (!providerRecord.isVerified) {
                    throw new ForbiddenException('Your provider account is not verified. Please wait for admin verification.');
                }

                if (!providerRecord.isActive) {
                    throw new ForbiddenException('Your provider account is inactive. Please activate your account to access services.');
                }
            }

            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            console.error('Error checking user status:', error);
            throw new UnauthorizedException('Unable to verify account status');
        }
    }
}
