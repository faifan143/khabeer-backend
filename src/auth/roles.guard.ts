import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 🔥 CRITICAL FIX: Validate user exists
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // 🔥 CRITICAL FIX: Validate user.role exists
    if (!user.role) {
      throw new UnauthorizedException('User role not found');
    }

    // Check if user has required role or if subadmin is trying to access admin endpoints
    const hasRole = requiredRoles.includes(user.role) || 
                   (user.role === 'SUBADMIN' && requiredRoles.includes('ADMIN'));

    if (!hasRole) {
      throw new UnauthorizedException(`User role '${user.role}' is not authorized. Required roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
