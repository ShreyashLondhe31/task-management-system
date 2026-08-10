import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('guest-login')
  @HttpCode(HttpStatus.OK)
  async guestLogin() {
    return this.authService.guestLogin();
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const loginResult = await this.authService.googleLogin(req);
    
    // Redirect to frontend with token
    if (loginResult) {
      return res.redirect(`http://localhost:3000/login?token=${loginResult.access_token}`);
    } else {
      return res.redirect(`http://localhost:3000/login?error=auth_failed`);
    }
  }
}
