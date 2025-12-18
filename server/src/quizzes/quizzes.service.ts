import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string, orgId: string) {
    return this.prisma.quiz.create({
      data: {
        ...data,
        creatorId: userId,
        organizationId: orgId,
      },
    });
  }

  async findAll() {
    return this.prisma.quiz.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: { question: true },
          // 👇 FIXED: Correct field name is 'order', not 'orderIndex'
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async update(id: string, data: Prisma.QuizUpdateInput) {
    return this.prisma.quiz.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.quiz.delete({
      where: { id },
    });
  }
}