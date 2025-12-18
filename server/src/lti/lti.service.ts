import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class LtiService {
  constructor(private prisma: PrismaService) {}

  async validateAndLogin(payload: any) {
    // 1. Map LTI Roles to our Internal Enums
    // LTI usually sends roles like "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"
    const ltiRoles = payload['https://purl.imsglobal.org/spec/lti/claim/roles'] || [];
    
    let userRole: Role = Role.STUDENT; // Default
    
    if (ltiRoles.some((r: string) => r.toLowerCase().includes('instructor') || r.toLowerCase().includes('admin'))) {
      userRole = Role.TEACHER;
    }

    // 2. Find or Create the User
    // Note: We use email as the unique key. 
    // If your LTI payload doesn't have email, we might need a fallback, but for now we assume it exists.
    const email = payload.email || `lti_user_${payload.sub}@polaris.edu`;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Update existing user role if needed (Optional strategy)
      // await this.prisma.user.update({ where: { id: user.id }, data: { role: userRole } });
    } else {
      // Create new user
      // We assign them to the Default Organization (The one created in seed.ts)
      const defaultOrgId = "11111111-1111-1111-1111-111111111111";

      user = await this.prisma.user.create({
        data: {
          email,
          fullName: payload.name || 'LTI User',
          role: userRole, // 👈 Directly setting the Enum
          organizationId: defaultOrgId,
          // ltiUserId: payload.sub, // ❌ Removed: This column doesn't exist in our current schema
        },
      });
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role, // 👈 No need for .name, it's already a string
      fullName: user.fullName,
    };
  }
}