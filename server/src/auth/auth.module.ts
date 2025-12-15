import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy'; // <--- We are importing the new file

@Module({
  imports: [
    UsersModule, 
    JwtModule.register({
      global: true,
      secret: "SUPER_SECRET_KEY_CHANGE_LATER",
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy], // <--- We added JwtStrategy here
  controllers: [AuthController],
})
export class AuthModule {}