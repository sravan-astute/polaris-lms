import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService 
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    
    // 🛠️ FIX: Added check to ensure user.password exists before calling bcrypt.compare
    // This prevents the 500 "Internal Server Error" if a user has a null password.
    if (user && user.password) {
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(pass, user.password);
      } catch (e) {
        // Fallback handled below
      }

      if (!isMatch && user.password === pass) {
        isMatch = true;
        console.log(`⚠️ WARNING: User ${email} logged in with PLAIN TEXT password.`);
      }

      if (isMatch) {
        const { password, ...result } = user;
        return result; 
      }
    }
    return null;
  }

  async signIn(email: string, pass: string) {
    const user = await this.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.login(user);
  }

  async login(user: any) {
    // 🛠️ FIX: Ensure the Role enum is converted to a string for the JWT payload
    const roleName = user.role?.toString() || 'STUDENT'; 

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: roleName,
      firstName: user.firstName 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      role: roleName,
      firstName: user.firstName, 
      lastName: user.lastName
    };
  }

  /**
   * 🛠️ Forgot Password Flow
   */
  async forgotPassword(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        expiresAt: expires,
        userId: user.id,
      },
    });

    console.log(`🔑 Reset Link: http://localhost:3000/reset-password?token=${resetToken}`);
    return { message: 'If this email exists, a reset link has been sent.' };
  }

  /**
   * 🛠️ Reset Password using Token
   */
  async resetPassword(token: string, newPass: string) {
    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token.');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { password: hashedPassword }
      }),
      this.prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { used: true }
      })
    ]);

    return { message: 'Password reset successful.' };
  }
}