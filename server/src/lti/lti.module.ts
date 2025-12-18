import { Module } from '@nestjs/common';
import { LtiController } from './lti.controller';
import { LtiService } from './lti.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    // Register the JWT Generator
    JwtModule.register({
      secret: 'SUPER_SECRET_KEY_CHANGE_THIS_IN_PROD', // The secret stamp
      signOptions: { expiresIn: '1h' }, // Wristband expires in 1 hour
    }),
  ],
  controllers: [LtiController],
  providers: [LtiService],
})
export class LtiModule {}