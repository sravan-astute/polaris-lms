import { 
  Body, 
  Controller, 
  Post, 
  Res, 
  HttpStatus, 
  Get, 
  UseGuards, 
  Request, 
  Patch,
  UnauthorizedException // 🛠️ Added this to fix the "Cannot find name" error
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard'; 
import { UsersService } from '../users/users.service'; 
import * as express from 'express'; 
import type { Response } from 'express'; 

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService, 
  ) {}

  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>, @Res() res: Response) {
    try {
      // 🛠️ TRY: Attempt to authenticate
      const tokenResult = await this.authService.signIn(signInDto.email, signInDto.password);
      
      res.cookie('auth_token', tokenResult.access_token, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'lax',
        path: '/',
      });

      return res.status(HttpStatus.OK).json({ 
        status: 'success', 
        message: 'Logged in successfully',
        role: tokenResult.role,
        access_token: tokenResult.access_token,
      });
    } catch (error) {
      // 🛠️ CATCH: If service throws UnauthorizedException, return JSON instead of 500
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: 'error',
        message: error.message || 'Invalid credentials',
      });
    }
  }

  /**
   * 🛠️ GET PROFILE
   * FIXED: Uses 'userId' because that is what your Strategy returns in the logs.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    // 🛠️ CRITICAL FIX: Change from req.user?.sub to req.user?.userId
    // Your logs proved that the ID is stored in 'userId'
    const userId = req.user?.userId; 
    
    if (!userId) {
      // This will show up in your terminal if the ID is missing
      throw new UnauthorizedException('User ID not found in request');
    }

    return this.usersService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/update')
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    // 🛠️ FIX: Change userId to sub
    const userId = req.user?.sub;
    return this.usersService.updateProfile(userId, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/change-password')
  async changePassword(@Request() req: any, @Body() passData: any) {
    // 🛠️ FIX: Change userId to sub
    const userId = req.user?.sub;
    return this.usersService.updatePassword(userId, passData);
  }

  /**
   * 🛠️ FORGOT PASSWORD
   * Generates a reset token and logs the URL (to be sent via email later).
   */
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  /**
   * 🛠️ RESET PASSWORD (Using Token)
   * Allows users who forgot their password to set a new one using the secure token.
   */
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPass: string
  ) {
    return this.authService.resetPassword(token, newPass);
  }
}