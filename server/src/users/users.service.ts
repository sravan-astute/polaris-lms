// server/src/users/users.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: any) { 
    // 1. Professional Extraction: Get domain from email automatically
    // Example: "sravan.k@astuteverse.com" -> "astuteverse.com"
    const emailDomain = createUserDto.email.split('@')[1]; 
    
    // 2. Determine Organization Name
    // Use provided name OR capitalize the domain (e.g., "Astuteverse")
    const orgName = createUserDto.organizationName || 
                    (emailDomain.split('.')[0].charAt(0).toUpperCase() + emailDomain.split('.')[0].slice(1));

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password, 
        fullName: createUserDto.fullName,
        role: 'ADMIN', 
        
        // 3. Create Organization with ALL required fields
        organization: {
          create: {
            name: orgName,
            domain: emailDomain, // ✅ Fixes "Argument domain is missing"
          }
        }
      } as any, // Keeps TypeScript happy while running against cloud DB
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