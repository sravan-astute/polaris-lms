import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * 1. Create User
   * UPDATED: Now maps names to firstName and lastName.
   */
  async create(createUserDto: any) { 
    const emailDomain = createUserDto.email.split('@')[1]; 
    const orgName = createUserDto.organizationName || 
                    (emailDomain.split('.')[0].charAt(0).toUpperCase() + emailDomain.split('.')[0].slice(1));
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const nameParts = (createUserDto.fullName || "").split(" ");
    const fName = createUserDto.firstName || nameParts[0] || "User";
    const lName = createUserDto.lastName || nameParts.slice(1).join(" ") || "";

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword, 
        firstName: fName,
        lastName: lName,
        role: 'ADMIN', 
        organization: {
          connectOrCreate: {
            where: { domain: emailDomain },
            create: { name: orgName, domain: emailDomain },
          },
        },
      },
    });
  }

  /**
   * 2. Get Profile
   */
  async getProfile(userId: string) {
    // 🛠️ Safety Check: If userId is missing, don't even call the DB
    if (!userId) {
      throw new BadRequestException('User ID is required to fetch profile');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true, 
        lastName: true,  
        role: true,
        phone: true, 
        bio: true, 
        jobTitle: true, 
        avatarUrl: true, 
        preferences: true, 
        createdAt: true,
        organization: {
          select: { name: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * 3. Update Profile Info
   */
  async updateProfile(userId: string, updateData: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: updateData.firstName, 
        lastName: updateData.lastName,   
        phone: updateData.phone,
        bio: updateData.bio,
        jobTitle: updateData.jobTitle, 
        avatarUrl: updateData.avatarUrl,
        preferences: updateData.preferences,
      },
    });
  }

  /**
   * 4. Secure Password Update
   */
  async updatePassword(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password does not match');

    const newHashedPassword = await bcrypt.hash(data.newPassword, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });
  }

  // --- Standard Lookups ---

  async findAll(): Promise<User[]> { 
    return this.prisma.user.findMany();
  }

  /**
   * 🛠️ FIX: Removed explicit 'select' to prevent 500 error.
   * By removing 'select', we avoid crashing if specific columns like 
   * 'firstName' or 'lastName' are missing in the actual database.
   */
  async findOne(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({ 
        where: { email }
      });
    } catch (error) {
      console.error("❌ findOne Database Error:", error.message);
      return null;
    }
  }

  /**
   * 🛠️ FIX: Removed explicit 'select' for stability.
   */
  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({ 
        where: { id }
      });
    } catch (error) {
      console.error("❌ findById Database Error:", error.message);
      return null;
    }
  }
}