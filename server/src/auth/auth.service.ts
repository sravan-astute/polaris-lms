import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    
    // Check if user exists AND has a password
    if (user && user.password) {
      
      // A: Try standard Bcrypt comparison (For real users)
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(pass, user.password);
      } catch (e) {
        // If password is not a hash (e.g. seed data), bcrypt throws error. Ignore it.
      }

      // B: FALLBACK - Check Plain Text (For Seed Data like "password123")
      if (!isMatch && user.password === pass) {
        isMatch = true;
        console.log(`⚠️ WARNING: User ${email} logged in with PLAIN TEXT password.`);
      }

      if (isMatch) {
        // Return user without password
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
    const roleName = user.role || 'STUDENT'; 

    const payload = { 
      email: user.email, // 👈 CHANGED 'username' TO 'email' TO MATCH STRATEGY
      sub: user.id, 
      role: roleName 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      role: roleName 
    };
  }
}