import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import { hashSync, compareSync } from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { Request, Response } from 'express';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_EXPIRES_IN_MS,
  ACCESS_TOKEN_NAME,
  Jwt,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN_MS,
  REFRESH_TOKEN_NAME,
  TokenPayloadDto,
} from '@ticketing/auth';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async signUp(dto: SignUpDto): Promise<Omit<User, 'password'>> {
    const candidate = await this.findUserByEmail(dto.email);
    if (candidate) {
      throw new BadRequestException('User with this email already exists');
    }
    const hashedPassword = hashSync(dto.password, 10);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    const { password, ...result } = await this.userRepository.save(user);
    return result;
  }

  async signIn(dto: SignInDto): Promise<Omit<User, 'password'>> {
    const user = await this.findUserByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }
    const isCompares = compareSync(dto.password, user.password);
    if (!isCompares) {
      throw new BadRequestException('Invalid password');
    }

    const { password, ...result } = user;
    return result;
  }

  async logout(res: Response): Promise<void> {
    res.clearCookie(ACCESS_TOKEN_NAME);
    res.clearCookie(REFRESH_TOKEN_NAME);
  }

  async refresh(
    req: Request,
    res: Response,
  ): Promise<{ accessToken: string | null }> {
    const refreshToken = req.cookies[REFRESH_TOKEN_NAME];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const payload = Jwt.verify(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken } = this.setTokensToCookies(res, {
      userId: payload.userId,
      email: payload.email,
    });
    return { accessToken };
  }

  setTokensToCookies(
    res: Response,
    payload: TokenPayloadDto,
  ): {
    accessToken: string | null;
    refreshToken: string | null;
  } {
    const accessToken = Jwt.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = Jwt.sign(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    res.cookie(ACCESS_TOKEN_NAME, accessToken, {
      httpOnly: true,
      maxAge: ACCESS_TOKEN_EXPIRES_IN_MS,
    });
    res.cookie(REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_EXPIRES_IN_MS,
    });

    return { accessToken, refreshToken };
  }
}
