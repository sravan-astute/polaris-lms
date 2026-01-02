export class User {
  id: string;
  email: string;
  
  // 🛠️ Match these exactly to schema.prisma
  firstName: string;
  lastName: string;
  
  role: string;
  phone?: string;
  bio?: string;
  jobTitle?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}