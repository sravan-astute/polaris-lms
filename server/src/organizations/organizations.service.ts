import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  // Create a new Tenant (Client)
  create(data: Prisma.OrganizationCreateInput) {
    return this.prisma.organization.create({
      data,
    });
  }

  // Find all Tenants
  findAll() {
    return this.prisma.organization.findMany();
  }

  // Find one by ID
  findOne(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
    });
  }
}