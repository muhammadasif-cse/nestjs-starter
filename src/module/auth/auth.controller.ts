import { SUCCESS } from '@/common/constant/message.constant';
import { ActionEnum } from '@/common/enum/action.enum';
import { APIResponse } from '@/utils/types/api-response';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { EmailLoginDto } from './dto/email-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

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
      message: SUCCESS(ActionEnum.DEFAULT, 'login'),
      data,
      timestamp: new Date().toISOString(),
      locale: 'en-US',
    };
  }

  // @Post('email/register')
  // @ApiOkResponse({
  //   description: 'Registration successful',
  // })
  // @HttpCode(HttpStatus.CREATED)
  // public async register(
  //   @Body() createUserDto: RegisterLoginDto,
  // ): Promise<APIResponse<UserEntity>> {
  //   const user = await this.service.register(createUserDto);
  //   return {
  //     statusCode: HttpStatus.CREATED,
  //     success: true,
  //     message: 'Registration successful',
  //     data: user,
  //     timestamp: new Date().toISOString(),
  //     locale: 'en-US',
  //   };
  // }

  // @Post('email/confirm')
  // @ApiOkResponse({
  //   description: 'Email confirmation successful',
  // })
  // @HttpCode(HttpStatus.NO_CONTENT)
  // public async confirmEmail(
  //   @Body() confirmEmailDto: AuthConfirmEmailDto,
  // ): Promise<APIResponse<void>> {
  //   await this.service.confirmEmail(confirmEmailDto.hash);
  //   return {
  //     statusCode: HttpStatus.NO_CONTENT,
  //     success: true,
  //     message: 'Email confirmed successfully',
  //     timestamp: new Date().toISOString(),
  //     locale: 'en-US',
  //   };
  // }

  // @Post('email/confirm/new')
  // @ApiOkResponse({
  //   description: 'New email confirmation successful',
  // })
  // @HttpCode(HttpStatus.NO_CONTENT)
  // public async confirmNewEmail(
  //   @Body() confirmEmailDto: AuthConfirmEmailDto,
  // ): Promise<APIResponse<void>> {
  //   await this.service.confirmNewEmail(confirmEmailDto.hash);
  //   return {
  //     statusCode: HttpStatus.NO_CONTENT,
  //     success: true,
  //     message: 'New email confirmed successfully',
  //     timestamp: new Date().toISOString(),
  //     locale: 'en-US',
  //   };
  // }

  // @Post('forgot/password')
  // @ApiOkResponse({
  //   description: 'Password reset email sent',
  // })
  // @HttpCode(HttpStatus.NO_CONTENT)
  // public async forgotPassword(
  //   @Body() forgotPasswordDto: AuthForgotPasswordDto,
  // ): Promise<APIResponse<void>> {
  //   await this.service.forgotPassword(forgotPasswordDto.email);
  //   return {
  //     statusCode: HttpStatus.NO_CONTENT,
  //     success: true,
  //     message: 'Password reset email sent successfully',
  //     timestamp: new Date().toISOString(),
  //     locale: 'en-US',
  //   };
  // }

  // @Post('reset/password')
  // @ApiOkResponse({
  //   description: 'Password reset successful',
  // })
  // @HttpCode(HttpStatus.NO_CONTENT)
  // public async resetPassword(
  //   @Body() resetPasswordDto: AuthResetPasswordDto,
  // ): Promise<APIResponse<void>> {
  //   await this.service.resetPassword(
  //     resetPasswordDto.hash,
  //     resetPasswordDto.password,
  //   );
  //   return {
  //     statusCode: HttpStatus.NO_CONTENT,
  //     success: true,
  //     message: 'Password reset successfully',
  //     timestamp: new Date().toISOString(),
  //     locale: 'en-US',
  //   };
  // }

  // @ApiBearerAuth()
  // @SerializeOptions({
  //   groups: ['me'],
  // })
  // @Get('me')
  // @UseGuards(AuthGuard('jwt'))
  // @ApiOkResponse({
  //   type: UserEntity,
  //   description: 'User details retrieved successfully',
  // })
  // @HttpCode(HttpStatus.OK)
  // public async me(
  //   @Request() request,
  // ): Promise<APIResponse<NullableType<UserEntity>>> {
  //   const user = await this.service.me(request.user);
  //   return {
  //     statusCode: HttpStatus.OK,
  //     success: true,
  //     message: 'User details retrieved successfully',
  //     data: user,
  //     timestamp: new Date().toISOString(),
  //     locale: 'en-US',
  //   };
  // }

  // @ApiBearerAuth()
  // @ApiOkResponse({
  //   type: RefreshResponseDto,
  //   description: 'Token refreshed successfully',
  // })
  // @SerializeOptions({
  //   groups: ['me'],
  // })
  // @Post('refresh')
  // @UseGuards(AuthGuard('jwt-refresh'))
  // @HttpCode(HttpStatus.OK)
  // public async refresh(
  //   @Request() request,
  // ): Promise<APIResponse<RefreshResponseDto>> {
  //   const data = await this.service.refreshToken({
  //     sessionId: request.user.sessionId,
  //     hash: request.user.hash,
  //   });
  //   return {
  //     statusCode: HttpStatus.OK,
  //     success: true,
  //     message: 'Token refreshed successfully',
  //     data,
  //     timestamp: new Date().toISOString(),
  //     locale: 'en-US',
  //   };
  // }

  // @ApiBearerAuth()
  // @ApiOkResponse({
  //   description: 'Logout successful',
  // })
  // @Post('logout')
  // @UseGuards(AuthGuard('jwt'))
  // @HttpCode(HttpStatus.NO_CONTENT)
  // public async logout(@Request() request): Promise<APIResponse<void>> {
  //   await this.service.logout({
  //     sessionId: request.user.sessionId,
  //   });
  //   return {
  //     statusCode: HttpStatus.NO_CONTENT,
  //     success: true,
  //     message: 'Logout successful',
  //     timestamp: new Date().toISOString(),
  //     locale: 'en-US',
  //   };
  // }

  // @ApiBearerAuth()
  // @SerializeOptions({
  //   groups: ['me'],
  // })
  // @Patch('me')
  // @UseGuards(AuthGuard('jwt'))
  // @HttpCode(HttpStatus.OK)
  // @ApiOkResponse({
  //   type: User,
  //   description: 'User details updated successfully',
  // })
  // public async update(
  //   @Request() request,
  //   @Body() userDto: AuthUpdateDto,
  // ): Promise<APIResponse<NullableType<User>>> {
  //   const user = await this.service.update(request.user, userDto);
  //   return {
  //     statusCode: HttpStatus.OK,
  //     success: true,
  //     message: 'User details updated successfully',
  //     data: user,
  //     timestamp: new Date().toISOString(),
  //     locale: 'en-US',
  //   };
  // }

  // @ApiBearerAuth()
  // @ApiOkResponse({
  //   description: 'User account deleted successfully',
  // })
  // @Delete('me')
  // @UseGuards(AuthGuard('jwt'))
  // @HttpCode(HttpStatus.NO_CONTENT)
  // public async delete(@Request() request): Promise<APIResponse<void>> {
  //   await this.service.softDelete(request.user);
  //   return {
  //     statusCode: HttpStatus.NO_CONTENT,
  //     success: true,
  //     message: 'User account deleted successfully',
  //     timestamp: new Date().toISOString(),
  //     locale: 'en-US',
  //   };
  // }
}
