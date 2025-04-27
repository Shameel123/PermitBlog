import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class setAuthCookieInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const newtoken: string =
      this.configService.get<string>('CookieToken') ?? 'default_token';
    const cookieExpiryTime: number =
      this.configService.get<number>('CookieExpiryTime') ?? 3600; // default to 3600 if undefined

    const cookieOptions = {
      maxAge: cookieExpiryTime,
      httpOnly: true,
      secure: true,
    };

    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      tap((data) => {
        res.cookie(newtoken, data.access_token, cookieOptions);
      }),
    );
  }
}
