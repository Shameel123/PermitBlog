import { SetMetadata } from '@nestjs/common';

export const Roles = (...args: any[]) => {
  return SetMetadata('roles', args);
};
