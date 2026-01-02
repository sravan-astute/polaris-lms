import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class LtiService {
  constructor(private prisma: PrismaService) {}

  async validateAndLogin(payload: any) {
    // 1. Map LTI Roles to our Internal Enums
    const ltiRoles = payload['https://purl.imsglobal.org/spec/lti/claim/roles'] || [];
    
    let userRole: Role = Role.STUDENT; // Default
    
    if (ltiRoles.some((r: string) => r.toLowerCase().includes('instructor') || r.toLowerCase().includes('admin'))) {
      userRole = Role.TEACHER;
    }

    // 2. Find or Create the User
    const email = payload.email || `lti_user_${payload.sub}@polaris.edu`;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // 🛠️ SPLIT Logic: Convert LTI name string into discrete fields
      const ltiName = payload.name || 'LTI User';
      const nameParts = ltiName.trim().split(/\s+/);
      const fName = nameParts[0] || 'LTI';
      const lName = nameParts.slice(1).join(' ') || 'User';

      // Create new user using the updated schema fields
      const defaultOrgId = "11111111-1111-1111-1111-111111111111";

      user = await this.prisma.user.create({
        data: {
          email,
          // 🛠️ UPDATED: firstName and lastName
          firstName: fName,
          lastName: lName,
          role: userRole,
          organizationId: defaultOrgId,
        },
      });
    }

    // 🛠️ UPDATED: Return reconstructed name for the Auth token/session
    return {
      userId: user.id,
      email: user.email,
      role: user.role, 
      firstName: user.firstName,
      lastName: user.lastName,
      // Helper for existing frontend parts that still expect a single name string
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    };
  }
}