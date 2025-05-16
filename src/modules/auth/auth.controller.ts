import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/common/interfaces/response.interface';

interface UserResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  sendOtp(@Body('email') email: string): Promise<{ message: string }> {
    return this.authService.sendOtp(email);
  }

  @Post('verify-otp')
  verifyOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ): Promise<ApiResponse<UserResponse>> {
    return this.authService.verifyOtp(email, otp);
  }

  @Post('oauth')
  async oauth(
    @Body() body: { email: string; name: string; image: string },
  ): Promise<ApiResponse<UserResponse>> {
    return this.authService.oauth({ userData: body });
  }
}
