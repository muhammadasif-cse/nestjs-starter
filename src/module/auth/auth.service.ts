import {
  NOT_FOUND,
  REQUIRED,
  SUCCESS,
} from '@/common/constant/message.constant';
import { ActionEnum } from '@/common/enum/action.enum';
import { MailService } from '@/mail/mail.service';
import ms from '@/utils/ms';
import { retrieveData } from '@/utils/retrieve-data';
import { APIResponse } from '@/utils/types/api-response';
import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
// import { DataSource } from 'typeorm';
import { RoleEnum } from '../role/enum/role.enum';
import { SessionEntity } from '../session/entities/session.entity';
import { SessionService } from '../session/session.service';
import { StatusEnum } from '../status/enum/status.enum';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterLoginDto } from './dto/register-login.dto';
import { AuthProvidersEnum } from './enums/auth-providers.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private sessionService: SessionService,
    private mailService: MailService,
    // @InjectDataSource()
    // private dataSource: DataSource,
  ) {}

  async validateLogin(loginDto: EmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);

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
    const userData = retrieveData<UserEntity>(user);
    console.log('userData', userData);

    if (userData.provider !== AuthProvidersEnum.email) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        message: REQUIRED(userData.provider),
        error: 'login_via_provider_required',
        timestamp: new Date().toISOString(),
        locale: 'en-US',
      });
    }

    if (!userData.password) {
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
      userData.password,
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
      userId: userData.id,
      hash,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: userData.id,
      role: userData.role,
      sessionId: session.id,
      hash,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user: userData,
    };
  }

  async register(
    registerDto: RegisterLoginDto,
  ): Promise<APIResponse<UserEntity>> {
    const registerInfo = {
      ...registerDto,
      role: {
        id: RoleEnum.user,
      },
      status: {
        id: StatusEnum.inactive,
      },
      provider: AuthProvidersEnum.email,
      providerId: 1,
    };

    const user = await this.userService.create(registerInfo);
    const userData = retrieveData<UserEntity>(user);

    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: userData.id,
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

    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: SUCCESS(ActionEnum.DEFAULT, 'Registration'),
      data: userData,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  private async getTokensData(data: {
    id: UserEntity['id'];
    role: UserEntity['role'];
    sessionId: SessionEntity['id'];
    hash: SessionEntity['hash'];
  }) {
    const tokenExpiresIn = process.env.AUTH_JWT_TOKEN_EXPIRES_IN as string;
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
