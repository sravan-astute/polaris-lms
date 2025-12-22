import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: any) { 
    // 1. Get domain from email (e.g., "astuteverse.com")
    const emailDomain = createUserDto.email.split('@')[1]; 
    
    // 2. Determine Organization Name (e.g., "Astuteverse")
    const orgName = createUserDto.organizationName || 
                    (emailDomain.split('.')[0].charAt(0).toUpperCase() + emailDomain.split('.')[0].slice(1));

    // 3. Encrypt Password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 4. Create User with Smart Logic
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword, 
        fullName: createUserDto.fullName,
        role: 'ADMIN', 
        
        // ✅ SMART LOGIC: Join existing OR Create new
        organization: {
          connectOrCreate: {
            where: {
              domain: emailDomain, // Check if an Org with this domain exists
            },
            create: {
              name: orgName,
              domain: emailDomain, // If not found, create it!
            },
          },
        },
      } as any,
    });
  }

  // --- Standard Lookups ---

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