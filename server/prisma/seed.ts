import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create the Organization
  const orgId = "11111111-1111-1111-1111-111111111111";
  
  const org = await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: {
      id: orgId,
      name: 'Polaris Demo School',
      domain: 'polaris.edu',
    },
  });

  console.log(`✅ Organization created: ${org.name}`);

  // 2. Create the Admin User
  const adminId = "00000000-0000-0000-0000-000000000000";
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { id: adminId },
    update: {},
    create: {
      id: adminId,
      email: 'admin@polaris.edu',
      fullName: 'Polaris Admin',
      password: hashedPassword,
      role: Role.ADMIN, // 👈 Uses the new Enum, not a table relation
      organizationId: org.id,
    },
  });

  console.log(`✅ Admin user created: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });