import { Injectable } from '@nestjs/common';
import { CreatePassageDto } from './dto/create-passage.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PassagesService {
  constructor(private prisma: PrismaService) {}

  async create(createPassageDto: CreatePassageDto, userId: string) {
    // 1. Find the User's Organization
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    // 2. Create the Passage
    return this.prisma.passage.create({
      data: {
        ...createPassageDto,
        organizationId: user.organizationId, // Link to Org
      },
    });
  }

  findAll() {
    return this.prisma.passage.findMany({
      include: { _count: { select: { questions: true } } } // Count linked questions
    });
  }

  findOne(id: string) {
    return this.prisma.passage.findUnique({
      where: { id },
      include: { questions: true }, // Load the children questions too!
    });
  }

  remove(id: string) {
    return this.prisma.passage.delete({ where: { id } });
  }
}