import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['backend_api_key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const backendApiKey = this.configService.get<string>('BackendApiKey');
    if (apiKey !== backendApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
