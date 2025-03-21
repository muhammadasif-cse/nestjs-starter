import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { UnprocessableEntityException } from '@nestjs/common';
import { AuthService } from '@/module/auth/auth.service';
import { SessionService } from '@/module/session/session.service';
import { UserEntity } from '@/module/user/entities/user.entity';
import { MailService } from '@/mail/mail.service';
import { EmailLoginDto } from '@/module/auth/dto/email-login.dto';

describe('AuthService', () => {
  let service: AuthService;

  // Mock dependencies
  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
  };

  const mockSessionService = {
    create: jest.fn().mockResolvedValue({ id: 'session1', userId: 'user1', hash: 'hash1' }),
    findOne: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockMailService = {
    userSignUp: jest.fn().mockResolvedValue(null),
    forgotPassword: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    // Mock environment variables
    process.env.AUTH_JWT_SECRET = 'test-secret';
    process.env.AUTH_JWT_TOKEN_EXPIRES_IN = '1h'; // Provide a valid value
    process.env.AUTH_REFRESH_SECRET = 'refresh-secret';
    process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN = '7d';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: SessionService, useValue: mockSessionService },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateLogin', () => {
    it('should return login response for valid credentials', async () => {
      const loginDto: EmailLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = {
        id: 'user1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 12),
        provider: 'email',
        role: { id: 1 },
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockSessionService.create.mockResolvedValue({
        id: 'session1',
        userId: 'user1',
        hash: 'hash1',
      });

      const result = await service.validateLogin(loginDto);

      expect(result).toEqual({
        token: 'mocked-jwt-token',
        refreshToken: 'mocked-jwt-token',
        tokenExpires: expect.any(Number),
        user: expect.objectContaining({ id: 'user1', email: 'test@example.com' }),
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockSessionService.create).toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException for invalid user', async () => {
      const loginDto: EmailLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.validateLogin(loginDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });
});