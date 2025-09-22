import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class ComprehensiveAuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prismaService: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        console.log('🔍 ComprehensiveAuthGuard URL Request:', request.url);
        console.log('🔍 ComprehensiveAuthGuard Method:', request.method);
        console.log('🔍 ComprehensiveAuthGuard Params:', request.params);
        console.log('🔍 ComprehensiveAuthGuard Query:', request.query);
        console.log('🔍 ComprehensiveAuthGuard Body:', request.body);
        console.log('🔍 ComprehensiveAuthGuard - User info:');
        console.log(`   User: ${JSON.stringify(user, null, 2)}`);

        // Check if user is authenticated (JwtAuthGuard should have already done this)
        if (!user) {
            console.log('❌ No user found in request - JWT authentication may have failed');
            throw new UnauthorizedException('Authentication required');
        }

        // Check if user has a role
        if (!user.role) {
            console.log('❌ No role found in user object');
            throw new UnauthorizedException('User role not found');
        }

        // Admin and SubAdmin users are always considered active and verified - skip all status checks
        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
            console.log('🔍 Admin/SubAdmin user detected, skipping all status checks');
            return this.checkRoleAuthorization(context, user);
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
                    throw new UnauthorizedException('Your account is inactive. Please contact support to reactivate your account.');
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
                    throw new UnauthorizedException('Your provider account is not verified. Please wait for admin verification.');
                }

                if (!providerRecord.isActive) {
                    throw new UnauthorizedException('Your provider account is inactive. Please activate your account to access services.');
                }
            }

            // Check role-based authorization
            return this.checkRoleAuthorization(context, user);
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            console.error('Error in comprehensive auth guard:', error);
            throw new UnauthorizedException('Unable to verify account status');
        }
    }

    private checkRoleAuthorization(context: ExecutionContext, user: any): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        console.log('🔍 Role Authorization Check:');
        console.log(`   User role: ${user.role}`);
        console.log(`   Required roles: ${requiredRoles ? requiredRoles.join(', ') : 'none'}`);

        if (!requiredRoles) {
            console.log('✅ No role requirements, access granted');
            return true;
        }

        const hasRole = requiredRoles.includes(user.role);
        console.log(`   Has required role: ${hasRole}`);

        if (!hasRole) {
            console.log(`❌ Access denied: User role '${user.role}' not in required roles: ${requiredRoles.join(', ')}`);
            throw new UnauthorizedException(`User role '${user.role}' is not authorized. Required roles: ${requiredRoles.join(', ')}`);
        }

        console.log('✅ Role authorization passed');
        return true;
    }
}
