import {
  EXISTS,
  NOT_FOUND,
  REQUIRED,
  SUCCESS,
} from '@/common/constant/message.constant';
import { ActionEnum } from '@/common/enum/action.enum';
import { MailService } from '@/mail/mail.service';
import ms from '@/utils/ms';
import { APIResponse } from '@/utils/types/api-response';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEnum } from '../role/enum/role.enum';
import { SessionEntity } from '../session/entities/session.entity';
import { SessionService } from '../session/session.service';
import { StatusEnum } from '../status/enum/status.enum';
import { UserEntity } from '../user/entities/user.entity';
import { EmailLoginDto } from './dto/email-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterLoginDto } from './dto/register-login.dto';
import { AuthProvidersEnum } from './enums/auth-providers.enum';
import { SocialInterface } from './social/interfaces/social.interface';
import * as process from 'node:process';
import { JwtPayloadType } from '@/module/auth/strategies/types/jwt-payload.type';
import { UpdateUserDto } from '@/module/user/dto/update-user.dto';
import { JwtRefreshPayloadType } from '@/module/auth/strategies/types/jwt-refresh-payload.type';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private sessionService: SessionService,
    private mailService: MailService,
  ) {}

  async validateLogin(loginDto: EmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: NOT_FOUND('User'),
        error: 'user_not_found',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: REQUIRED(user.provider),
        error: 'login_via_provider_required',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    if (!user.password) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: REQUIRED('Password'),
        error: 'password_required',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: 'Incorrect password',
        error: 'incorrect_password',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(crypto.randomBytes(32).toString('hex'))
      .digest('hex');

    const session = await this.sessionService.create({
      userId: user.id,
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      hash,
    });

    // user data without password
    const { password, ...userData } = user;

    return {
      refreshToken,
      token,
      tokenExpires,
      user: userData,
    };
  }

  async validateSocialLogin(
    authProvider: string,
    socialData: SocialInterface,
  ): Promise<LoginResponseDto> {
    let user: UserEntity | null = null;
    const socialEmail = socialData.email?.toLowerCase();
    let userByEmail: UserEntity | null = null;

    if (socialEmail) {
      userByEmail = await this.userRepository.findOne({
        where: { email: socialEmail },
      });
    }

    if (socialData.id) {
      user = await this.userRepository.findOne({
        where: {
          providerId: socialData.id as unknown as number,
          provider: authProvider,
        },
      });
    }

    if (user) {
      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
      }
      await this.userRepository.save(user);
    } else if (userByEmail) {
      user = userByEmail;
    } else if (socialData.id) {
      const newUser = this.userRepository.create({
        email: socialEmail,
        name: socialData.name,
        providerId: socialData.id as unknown as number,
        provider: authProvider,
        role: { id: RoleEnum.user },
        status: { id: StatusEnum.active },
      });

      user = await this.userRepository.save(newUser);
    }

    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(crypto.randomBytes(32).toString('hex'))
      .digest('hex');

    const session = await this.sessionService.create({
      userId: user.id,
      hash,
    });

    const {
      token: jwtToken,
      refreshToken,
      tokenExpires,
    } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
      hash,
    });

    return {
      refreshToken,
      token: jwtToken,
      tokenExpires,
      user,
    };
  }

  async register(
    registerDto: RegisterLoginDto,
  ): Promise<APIResponse<UserEntity>> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.CONFLICT,
        success: false,
        message: EXISTS('User'),
        error: 'email_already_exists',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const registerInfo = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: { id: RoleEnum.user },
      status: { id: StatusEnum.inactive },
      provider: AuthProvidersEnum.email,
      providerId: 1,
    });

    const user = await this.userRepository.save(registerInfo);

    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: user.id,
      },
      {
        secret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
        expiresIn: process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
      },
    );

    await this.mailService.userSignUp({
      to: registerDto.email,
      data: {
        name: registerDto.name,
        hash: hash,
      },
    });

    const { password, ...userWithoutPassword } = user;

    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: SUCCESS(ActionEnum.DEFAULT, 'Registration'),
      data: userWithoutPassword as UserEntity,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  async confirmEmail(hash: string): Promise<void> {
    let userId: UserEntity['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: UserEntity['id'];
      }>(hash, {
        secret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: 'Invalid hash',
        error: 'invalidHash',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || user?.status?.id !== StatusEnum.inactive) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: NOT_FOUND('User'),
        error: 'user_not_found',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    user.status = {
      id: StatusEnum.active,
      name: 'Active',
      description: 'User is active',
    };
    await this.userRepository.update(user.id, user);
  }

  async confirmNewEmail(hash: string): Promise<void> {
    let userId: UserEntity['id'];
    let newEmail: UserEntity['email'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: UserEntity['id'];
        newEmail: UserEntity['email'];
      }>(hash, {
        secret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
      });

      userId = jwtData.confirmEmailUserId;
      newEmail = jwtData.newEmail;
    } catch {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: 'Invalid hash',
        error: 'invalidHash',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        success: false,
        message: NOT_FOUND('User'),
        error: 'userNotFound',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    user.email = newEmail;
    user.status = {
      id: StatusEnum.active,
      name: 'Active',
      description: 'User is active',
    };
    await this.userRepository.update(user.id, user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email: email } });

    if (!user) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: NOT_FOUND('User with this email'),
        error: 'emailNotExists',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    const tokenExpiresIn = process.env.AUTH_FORGOT_TOKEN_EXPIRES_IN as string;
    const tokenExpires = Date.now() + (ms(tokenExpiresIn) || 0);

    const hash = await this.jwtService.signAsync(
      { forgotUserId: user.id },
      {
        secret: process.env.AUTH_FORGOT_SECRET,
        expiresIn: tokenExpiresIn,
      },
    );

    await this.mailService.forgotPassword({
      to: email,
      data: { hash, tokenExpires, name: user.name },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    let userId: UserEntity['id'];

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: UserEntity['id'];
      }>(hash, {
        secret: process.env.AUTH_FORGOT_SECRET,
      });

      userId = jwtData.forgotUserId;
    } catch {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: 'Invalid hash',
        error: 'invalidHash',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: NOT_FOUND('User'),
        error: 'userNotFound',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    user.password = await bcrypt.hash(password, 10);
    await this.sessionService.deleteByUserId(user.id);
    await this.userRepository.update(user.id, user);
  }

  async me(userJwtPayload: JwtPayloadType): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id: userJwtPayload.id } });
  }

  async update(
    userJwtPayload: JwtPayloadType,
    userDto: UpdateUserDto,
  ): Promise<UserEntity | null> {
    const currentUser = await this.userRepository.findOne({
      where: { id: userJwtPayload.id },
    });

    if (!currentUser) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: NOT_FOUND('User'),
        error: 'user_not_found',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    await this.userRepository.update(userJwtPayload.id, userDto);
    return this.userRepository.findOne({ where: { id: userJwtPayload.id } });
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const session = await this.sessionService.findOne(data.sessionId);

    if (!session) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        success: false,
        message: 'Invalid session',
        error: 'sessionNotFound',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    if (session.hash !== data.hash) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        success: false,
        message: 'Invalid refresh token',
        error: 'invalidHash',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    const user = await this.userRepository.findOne({
      where: { id: session.user.id },
    });
    if (!user?.role) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        success: false,
        message: 'User role not found',
        error: 'roleNotFound',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    await this.sessionService.update(session.id, { hash });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.user.id,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      sessionId: session.id,
      hash,
    });

    return { token, refreshToken, tokenExpires };
  }

  async softDelete(user: UserEntity): Promise<void> {
    await this.userRepository.remove(user);
  }

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>): Promise<void> {
    await this.sessionService.deleteById(data.sessionId);
  }

  private async getTokensData(data: {
    id: UserEntity['id'];
    role: UserEntity['role'];
    sessionId: SessionEntity['id'];
    hash: SessionEntity['hash'];
  }) {
    const tokenExpiresIn =
      process.env.AUTH_JWT_TOKEN_EXPIRES_IN || ('1h' as string);
    const tokenExpires = Date.now() + (ms(tokenExpiresIn) || 0);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: process.env.AUTH_JWT_SECRET,
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
          hash: data.hash,
        },
        {
          secret: process.env.AUTH_REFRESH_SECRET,
          expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
