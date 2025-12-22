import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting "Permanent User" Seed...');

  // 1. Ensure the Organization Exists
  const orgId = "11111111-1111-1111-1111-111111111111"; // Fixed ID for stability
  
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

  // 2. Define the Team
  const passwordHash = await bcrypt.hash('password123', 10); // Default password for everyone

  const users = [
    // --- SUPER ADMINS ---
    {
      email: 'niranjan.k@astuteverse.com',
      name: 'Niranjan K',
      role: Role.SUPER_ADMIN
    },
    {
      email: 'sravan.k@astuteverse.com',
      name: 'Sravan K',
      role: Role.SUPER_ADMIN
    },
    // --- ADMIN ---
    {
      email: 'saravana.k@astuteverse.com',
      name: 'Saravana K',
      role: Role.ADMIN
    },
    // --- PUBLISHER (Content Manager) ---
    {
      email: 'sasimala@astuteverse.com',
      name: 'Sasimala',
      role: Role.CONTENT_MANAGER
    },
    // --- REVIEWER ---
    {
      email: 'mirunaalni.r@astuteverse.com',
      name: 'Mirunaalni R',
      role: Role.REVIEWER
    },
    // --- AUTHOR (Content Developer) ---
    {
      email: 'content@astuteverse.com',
      name: 'Content Team',
      role: Role.CONTENT_DEVELOPER
    }
  ];

  // 3. Create/Restore Users Loop
  for (const user of users) {
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role }, // Ensure role is correct if it changed
      create: {
        email: user.email,
        fullName: user.name,
        password: passwordHash,
        role: user.role,
        organizationId: org.id,
      },
    });
    console.log(`👤 Verified User: ${upsertedUser.email} [${upsertedUser.role}]`);
  }

  console.log('✨ Seeding complete. You can now login.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });