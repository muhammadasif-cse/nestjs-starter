import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from '@/module/auth/auth.controller';
import { AuthService } from '@/module/auth/auth.service';
import { SessionService } from '@/module/session/session.service';
import { UserEntity } from '@/module/user/entities/user.entity';
import { MailService } from '@/mail/mail.service';
import { EmailLoginDto } from '@/module/auth/dto/email-login.dto';
import { RegisterLoginDto } from '@/module/auth/dto/register-login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock dependencies
  const mockAuthService = {
    validateLogin: jest.fn(),
    register: jest.fn(),
    me: jest.fn(),
    logout: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockSessionService = {
    create: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockMailService = {
    userSignUp: jest.fn(),
    forgotPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: SessionService, useValue: mockSessionService },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login response', async () => {
      const loginDto: EmailLoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const loginResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        tokenExpires: Date.now() + 3600000,
        user: { id: '1', email: 'test@example.com' },
      };

      mockAuthService.validateLogin.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        statusCode: 200,
        success: true,
        message: expect.any(String),
        data: loginResponse,
        timestamp: expect.any(String),
        locale: 'en-US',
      });
      expect(mockAuthService.validateLogin).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should return registration response', async () => {
      const registerDto: RegisterLoginDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };
      const registerResponse = {
        statusCode: 201,
        success: true,
        message: expect.any(String),
        data: { id: '1', email: 'newuser@example.com', name: 'New User' },
        timestamp: expect.any(String),
        locale: 'en-US',
      };

      mockAuthService.register.mockResolvedValue(registerResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(registerResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });
});