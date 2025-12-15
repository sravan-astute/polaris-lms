import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaService } from '../prisma/prisma.service'; // <--- Import

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, PrismaService], // <--- Add Provider
})
export class OrganizationsModule {}