import { SUCCESS } from '@/common/constant/message.constant';
import { ActionEnum } from '@/common/enum/action.enum';
import { APIResponse } from '@/utils/types/api-response';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  SerializeOptions,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterLoginDto } from './dto/register-login.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { ForgotPasswordDto } from '@/module/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/module/auth/dto/reset-password.dto';
import { RefreshResponseDto } from '@/module/auth/dto/refresh-response.dto';
import { ConfirmEmailDto } from '@/module/auth/dto/confirm-email.dto';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/login')
  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'Login successful',
  })
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() loginDto: EmailLoginDto,
  ): Promise<APIResponse<LoginResponseDto>> {
    const data = await this.service.validateLogin(loginDto);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DEFAULT, 'Login'),
      data,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  @Post('email/register')
  @ApiOkResponse({
    description: 'Registration successful',
    type: UserEntity,
  })
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Body() createUserDto: RegisterLoginDto,
  ): Promise<APIResponse<UserEntity>> {
    return await this.service.register(createUserDto);
  }

  @Post('email/confirm')
  @ApiOkResponse({
    description: 'Email confirmation successful',
  })
  @HttpCode(HttpStatus.OK)
  public async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
  ): Promise<APIResponse<void>> {
    await this.service.confirmEmail(confirmEmailDto.hash);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DEFAULT, 'Email confirmation'),
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  @Post('email/confirm/new')
  @ApiOkResponse({
    description: 'New email confirmation successful',
  })
  @HttpCode(HttpStatus.OK)
  public async confirmNewEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
  ): Promise<APIResponse<void>> {
    await this.service.confirmNewEmail(confirmEmailDto.hash);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DEFAULT, 'New email confirmation'),
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  @Post('forgot/password')
  @ApiOkResponse({
    description: 'Password reset email sent',
  })
  @HttpCode(HttpStatus.OK)
  public async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<APIResponse<void>> {
    await this.service.forgotPassword(forgotPasswordDto.email);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DEFAULT, 'Password reset email sent'),
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  @Post('reset/password')
  @ApiOkResponse({
    description: 'Password reset successful',
  })
  @HttpCode(HttpStatus.OK)
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<APIResponse<void>> {
    await this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DEFAULT, 'Password reset'),
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: UserEntity,
    description: 'User details retrieved successfully',
  })
  @HttpCode(HttpStatus.OK)
  public async me(
    @Request() request: any,
  ): Promise<APIResponse<UserEntity | null>> {
    const user = await this.service.me(request.user);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.GET, 'User'),
      data: user,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOkResponse({
    type: RefreshResponseDto,
    description: 'Token refreshed successfully',
  })
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Request() request: any,
  ): Promise<APIResponse<Omit<LoginResponseDto, 'user'>>> {
    const data = await this.service.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DEFAULT, 'Token refresh'),
      data,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    description: 'Logout successful',
  })
  @HttpCode(HttpStatus.OK)
  public async logout(@Request() request: any): Promise<APIResponse<void>> {
    await this.service.logout({ sessionId: request.user.sessionId });
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DEFAULT, 'Logout'),
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: UserEntity,
    description: 'User details updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  public async update(
    @Request() request: any,
    @Body() userDto: UpdateUserDto,
  ): Promise<APIResponse<UserEntity | null>> {
    const user = await this.service.update(request.user, userDto);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.UPDATE, 'User'),
      data: user,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  @ApiBearerAuth()
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    description: 'User account deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  public async delete(@Request() request: any): Promise<APIResponse<void>> {
    await this.service.softDelete(request.user);
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: SUCCESS(ActionEnum.DELETE, 'User'),
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }
}
