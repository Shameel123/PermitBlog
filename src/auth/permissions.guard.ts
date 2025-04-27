import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Permit } from 'permitio';

const permit = new Permit({
  pdp: process.env.PERMIT_IO_PDP,
  token: process.env.PERMIT_IO_TOKEN,
});

@Injectable()
export class PermissionsGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    console.log('Request:', request);

    // Add the authorization logic here with Permit.io.
    // If the user has the necessary permissions, return true.
    // If the user does not have the necessary permissions, throw an UnauthorizedException.

    const userHasPermission = await permit.check(
      'demo_user@gmail.com',
      'view',
      'protected-page',
    );

    console.log(userHasPermission);

    if (!userHasPermission) {
      throw new UnauthorizedException(
        'You do not have the necessary permissions.',
      );
    }
    return true;
  }
}
