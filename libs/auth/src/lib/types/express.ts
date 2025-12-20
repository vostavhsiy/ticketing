import { TokenPayload } from '../jwt';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user: TokenPayload;
}
