import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express'; 

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>, @Res() res: Response) {
    // 1. Validate credentials and get the token
    const tokenResult = await this.authService.signIn(signInDto.email, signInDto.password);
    
    // 2. Set the Cookie (Keep this, it's good for later)
    res.cookie('auth_token', tokenResult.access_token, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
      path: '/',
    });

    // 3. Return Success AND THE TOKEN
    return res.status(HttpStatus.OK).json({ 
      status: 'success', 
      message: 'Logged in successfully',
      role: tokenResult.role,
      access_token: tokenResult.access_token, // 👈 ADDED THIS LINE
    });
  }
}