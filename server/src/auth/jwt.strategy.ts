import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: "POLARIS_SECRET_KEY", // 👈 HARDCODED: The Lock
    });
  }

  async validate(payload: any) {
    // 🚨 LOG 1: Did we even get here?
    console.log("🔓 STRATEGY HIT! Token was valid. Payload received:", payload);
    
    // 🚨 LOG 2: Check the ID we are returning
    const user = { userId: payload.sub, email: payload.email, role: payload.role };
    console.log("👤 Returning User:", user);
    
    return user;
}
}