import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting "Project Polaris" User Seed...');

  // 1. Ensure the Organization Exists (Phase 0: Organizations table)
  // [cite: 24, 25, 26]
  const orgId = "11111111-1111-1111-1111-111111111111"; 
  
  const org = await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: {
      id: orgId,
      name: 'Astuteverse',
      domain: 'astuteverse.com',
    },
  });

  console.log(`✅ Organization Ready: ${org.name}`);

  // 2. Define the Team with Hashed Passwords (Phase 1: Week 3 logic)
  // [cite: 113, 118, 119]
  const passwordHash = await bcrypt.hash('password123', 10); 

  const users = [
    {
      email: 'niranjan.k@astuteverse.com',
      firstName: 'Niranjan',
      lastName: 'K',
      role: Role.SUPER_ADMIN
    },
    {
      email: 'sravan.k@astuteverse.com',
      firstName: 'Sravan',
      lastName: 'K',
      role: Role.SUPER_ADMIN
    },
    {
      email: 'saravana.k@astuteverse.com',
      firstName: 'Saravana',
      lastName: 'K',
      role: Role.ADMIN
    },
    {
      email: 'sasimala@astuteverse.com',
      firstName: 'Sasimala',
      lastName: '', 
      role: Role.CONTENT_MANAGER
    },
    {
      email: 'mirunaalni.r@astuteverse.com',
      firstName: 'Mirunaalni',
      lastName: 'R',
      role: Role.REVIEWER
    },
    {
      email: 'content@astuteverse.com',
      firstName: 'Content',
      lastName: 'Team',
      role: Role.CONTENT_DEVELOPER
    }
  ];

  // 3. Create/Restore Users Loop (Phase 1: Authentication & User Logic)
  // [cite: 114, 115]
  for (const user of users) {
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: { 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      create: {
        email: user.email,
        firstName: user.firstName, 
        lastName: user.lastName,   
        password: passwordHash,
        role: user.role,
        organizationId: org.id,
      },
    });
    console.log(`👤 Verified User: ${upsertedUser.email} [${upsertedUser.role}]`);
  }

  console.log('✨ Seeding complete. Use "password123" to login.');
}

main()
  .catch((e) => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });