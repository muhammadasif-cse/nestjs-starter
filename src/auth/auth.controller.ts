import { User } from '@/modules/users/domain/user';
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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NullableType } from '../utils/types/nullable.type';
import { AuthService } from './auth.service';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';

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
    @Body() loginDto: AuthEmailLoginDto,
  ): Promise<APIResponse<LoginResponseDto>> {
    const data = await this.service.validateLogin(loginDto);
    return {
      message: 'Login successful',
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Post('email/register')
  @ApiOkResponse({
    description: 'Registration successful',
  })
  @HttpCode(HttpStatus.CREATED)
  public async register(
    @Body() createUserDto: AuthRegisterLoginDto,
  ): Promise<APIResponse<User>> {
    const user = await this.service.register(createUserDto);
    return {
      message: 'Registration successful',
      statusCode: HttpStatus.CREATED,
      data: user,
    };
  }

  @Post('email/confirm')
  @ApiOkResponse({
    description: 'Email confirmation successful',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<APIResponse<void>> {
    await this.service.confirmEmail(confirmEmailDto.hash);
    return {
      message: 'Email confirmed successfully',
      statusCode: HttpStatus.NO_CONTENT,
    };
  }

  @Post('email/confirm/new')
  @ApiOkResponse({
    description: 'New email confirmation successful',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async confirmNewEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<APIResponse<void>> {
    await this.service.confirmNewEmail(confirmEmailDto.hash);
    return {
      message: 'New email confirmed successfully',
      statusCode: HttpStatus.NO_CONTENT,
    };
  }

  @Post('forgot/password')
  @ApiOkResponse({
    description: 'Password reset email sent',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<APIResponse<void>> {
    await this.service.forgotPassword(forgotPasswordDto.email);
    return {
      message: 'Password reset email sent successfully',
      statusCode: HttpStatus.NO_CONTENT,
    };
  }

  @Post('reset/password')
  @ApiOkResponse({
    description: 'Password reset successful',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resetPassword(
    @Body() resetPasswordDto: AuthResetPasswordDto,
  ): Promise<APIResponse<void>> {
    await this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
    return {
      message: 'Password reset successfully',
      statusCode: HttpStatus.NO_CONTENT,
    };
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({
    type: User,
    description: 'User details retrieved successfully',
  })
  @HttpCode(HttpStatus.OK)
  public async me(
    @Request() request,
  ): Promise<APIResponse<NullableType<User>>> {
    const user = await this.service.me(request.user);
    return {
      message: 'User details retrieved successfully',
      statusCode: HttpStatus.OK,
      data: user,
    };
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RefreshResponseDto,
    description: 'Token refreshed successfully',
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Request() request,
  ): Promise<APIResponse<RefreshResponseDto>> {
    const data = await this.service.refreshToken({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });
    return {
      message: 'Token refreshed successfully',
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Logout successful',
  })
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request): Promise<APIResponse<void>> {
    await this.service.logout({
      sessionId: request.user.sessionId,
    });
    return {
      message: 'Logout successful',
      statusCode: HttpStatus.NO_CONTENT,
    };
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: User,
    description: 'User details updated successfully',
  })
  public async update(
    @Request() request,
    @Body() userDto: AuthUpdateDto,
  ): Promise<APIResponse<NullableType<User>>> {
    const user = await this.service.update(request.user, userDto);
    return {
      message: 'User details updated successfully',
      statusCode: HttpStatus.OK,
      data: user,
    };
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'User account deleted successfully',
  })
  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request): Promise<APIResponse<void>> {
    await this.service.softDelete(request.user);
    return {
      message: 'User account deleted successfully',
      statusCode: HttpStatus.NO_CONTENT,
    };
  }
}
