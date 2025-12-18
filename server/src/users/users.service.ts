import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: any) { 
  
  // 1. Use "Astute Verse" as the default Organization
  const orgName = createUserDto.organizationName || "Astute Verse";

  // 2. Create User AND Organization in one step
  return this.prisma.user.create({
    data: {
      email: createUserDto.email,
      password: createUserDto.password, 
      fullName: createUserDto.fullName,
      role: 'ADMIN', // Force the first user to be an Admin
      organization: {
        create: {
          name: orgName,
          // This converts "Astute Verse" -> "astute-verse" for the URL
          slug: orgName.toLowerCase().replace(/ /g, '-'), 
        }
      }
    },
  });
}

  // 👇 ADDED THIS METHOD
  async findAll(): Promise<User[]> { 
    return this.prisma.user.findMany();
  }

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}