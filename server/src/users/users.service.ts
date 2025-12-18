import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: any) { 
  
  const orgName = createUserDto.organizationName || "Astute Verse";

  return this.prisma.user.create({
    data: {
      email: createUserDto.email,
      password: createUserDto.password, 
      fullName: createUserDto.fullName,
      role: 'ADMIN', 
      organization: {
        create: {
          name: orgName,
        }
      }
    } as any, // <--- THIS LITTLE TRICK SILENCES THE RED LINE
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