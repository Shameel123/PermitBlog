import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userDoc = request.user && request.user._doc;
    if (userDoc && typeof userDoc === 'object') {
      return userDoc;
    }
    return null;
  },
);
