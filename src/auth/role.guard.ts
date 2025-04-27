import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  // No access token provided, deny access
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get('roles', context.getHandler());

    if (!roles) {
      return false;
    }

    // Retrieve request object from the execution context
    const request = context.switchToHttp().getRequest();

    // Extract access token from the request headers or query params
    const accessToken = request.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return false;
    }

    // // Decode access token to get user information including roles
    const decodedToken = this.jwtService.verify(accessToken, {
      secret: this.configService.get<string>('JwtSecret'),
    });

    const userRole: string = decodedToken.role;

    if (!userRole) return false;

    if (Array.isArray(roles) && roles[0].includes(userRole)) {
      return true;
    }

    return false;
  }
}
