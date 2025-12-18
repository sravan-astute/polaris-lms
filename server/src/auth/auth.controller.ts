import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express'; // Use 'type' for safety

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>, @Res() res: Response) {
    // 1. Validate credentials
    const tokenResult = await this.authService.signIn(signInDto.email, signInDto.password);
    
    // 2. Set the Cookie (Just like LTI does!)
    res.cookie('auth_token', tokenResult.access_token, {
      httpOnly: true,
      secure: false, // Set 'true' in production
      sameSite: 'lax',
      path: '/',
    });

    // 3. Return Success
    return res.status(HttpStatus.OK).json({ 
      status: 'success', 
      message: 'Logged in successfully',
      role: tokenResult.role // Optional: send role back so frontend knows where to go
    });
  }
}