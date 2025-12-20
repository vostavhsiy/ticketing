import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { BadRequestException } from '@nestjs/common';

const userArray: User[] = [
  {
    id: '1',
    email: 'user1@example.com',
    password: 'hashedpassword1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'user2@example.com',
    password: 'hashedpassword2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(userArray[0]),
            save: jest.fn().mockResolvedValue(userArray[0]),
            create: jest.fn().mockResolvedValue(userArray[0]),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return user without password after signUp', async () => {
    jest.spyOn(service, 'findUserByEmail').mockResolvedValueOnce(null);

    const dto: SignUpDto = {
      email: userArray[0].email,
      password: userArray[0].password,
    };

    const result = await service.signUp(dto);
    expect(result.email).toEqual(userArray[0].email);
  });

  it('should throw error with existing user on signUp', async () => {
    const dto: SignUpDto = {
      email: userArray[0].email,
      password: userArray[0].password,
    };

    await expect(service.signUp(dto)).rejects.toThrow(
      new BadRequestException('User with this email already exists'),
    );
  });

  it('should throw error with bad password on signIn', async () => {
    const dto: SignInDto = {
      email: userArray[0].email,
      password: userArray[0].password,
    };

    await expect(service.signIn(dto)).rejects.toThrow(
      new BadRequestException('Invalid password'),
    );
  });
});
