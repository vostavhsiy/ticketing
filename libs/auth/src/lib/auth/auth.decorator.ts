import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

export const Auth = () => {
  return applyDecorators(UseGuards(AuthGuard));
};
