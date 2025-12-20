import * as jwt from 'jsonwebtoken';

export interface TokenPayloadDto {
  userId: string;
  email: string;
}

export interface TokenPayload extends TokenPayloadDto, jwt.JwtPayload {}

export class Jwt {
  private static readonly secret = process.env.JWT_SECRET;

  static sign(
    payload: TokenPayloadDto,
    options?: jwt.SignOptions,
  ): string | null {
    if (!this.secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    try {
      return jwt.sign(payload, this.secret, options);
    } catch (error) {
      return null;
    }
  }

  static verify(
    token: string,
    options?: jwt.VerifyOptions,
  ): TokenPayload | null {
    if (!this.secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    try {
      const payload = jwt.verify(token, this.secret, options);
      return typeof payload === 'string'
        ? JSON.parse(payload)
        : (payload as TokenPayload);
    } catch (error) {
      return null;
    }
  }
}
