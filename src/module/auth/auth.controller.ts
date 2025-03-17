import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  //   @SerializeOptions({
  //     groups: ['me'],
  //   })
  //   @Post('email/login')
  //   @ApiOkResponse({
  //     type: LoginResponseDto,
  //     description: 'Login successful',
  //   })
  //   @HttpCode(HttpStatus.OK)
  //   public async login(
  //     @Body() loginDto: EmailLoginDto,
  //   ): Promise<APIResponse<LoginResponseDto>> {
  //     const data = await this.service.validateLogin(loginDto);
  //     return {
  //       message: 'Login successful',
  //       statusCode: HttpStatus.OK,
  //       data,
  //     };
  //   }
}
