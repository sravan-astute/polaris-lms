import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt'; // <--- Import the scrambler

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 1. Create a User (With Hashed Password)
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const saltOrRounds = 10;
    // If a password is provided, scramble it. If not, ignore (for now).
    if (data.password) {
      data.password = await bcrypt.hash(data.password, saltOrRounds);
    }
    
    return this.prisma.user.create({
      data,
    });
  }

  // 2. Find User by Email
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // 3. List All Users
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: { organization: true },
    });
  }
}