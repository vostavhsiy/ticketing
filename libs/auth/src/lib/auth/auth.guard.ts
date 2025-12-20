import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Jwt } from '../jwt';
import { AuthRequest } from '../types/express';
import { ACCESS_TOKEN_NAME } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await Jwt.verify(token);
      if (!payload) {
        throw new UnauthorizedException();
      }
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: AuthRequest): string | undefined {
    const accessToken = request.cookies[ACCESS_TOKEN_NAME];
    return accessToken;
  }
}
