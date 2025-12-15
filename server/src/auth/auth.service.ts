import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // <--- Import here too

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    // 1. Find the user
    const user = await this.usersService.findByEmail(email);

    // 2. Check if user exists
    if (!user) {
      throw new UnauthorizedException();
    }

    // 3. COMPARE THE HASH (The Real Security Check)
    // If user has no password (e.g. LTI user), fail.
    // If passwords don't match, fail.
    const isMatch = user.password ? await bcrypt.compare(pass, user.password) : false;

    if (!isMatch) {
       throw new UnauthorizedException();
    }

    // 4. Generate Token
    const payload = { sub: user.id, username: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}