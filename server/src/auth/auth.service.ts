import { Injectable, UnauthorizedException } from '@nestjs/common'; // 👈 Added Import
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  // 1. Verify User Credentials
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    
    // Check if user exists AND has a password (LTI users don't have passwords)
    if (user && user.password) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        // Return user without password
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  // 2. Sign In (Called by Controller)
  async signIn(email: string, pass: string) {
    const user = await this.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.login(user);
  }

  // 3. Generate Token
  async login(user: any) {
    // Safely extract role name
    const roleName = user.role?.name || 'STUDENT';

    const payload = { 
      username: user.email, 
      sub: user.id, 
      role: roleName 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      role: roleName // 👈 ADD THIS LINE!
    };
  }
}