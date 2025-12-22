import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  private generateCode() {
    return 'ITEM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  // 1. We still accept the arguments to match the Controller, but we will look up the REAL Org ID
  async create(data: any, userId: string, orgIdFallback?: string) {
    
    // 🔍 STEP 1: Get the User and their Real Organization ID
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true }
    });

    // Safety Check: If user was deleted or has no org
    if (!user || !user.organizationId) {
        console.error("❌ SAVE FAILED: User or Organization not found for ID:", userId);
        throw new BadRequestException("User must belong to an Organization to create items.");
    }

    const realOrgId = user.organizationId; // <--- WE USE THIS NOW

    // 🔍 STEP 2: Prepare Data
    const { id, options, tags, code, ...rest } = data;

    // Parse Tags safely
    let tagsArray: string[] = [];
    if (typeof tags === 'string' && tags.length > 0) {
        tagsArray = tags.split(',').map((t: string) => t.trim());
    } else if (Array.isArray(tags)) {
        tagsArray = tags;
    }

    const jsonPayload = { options: options || [] };
    const itemCode = code && code.trim() !== '' ? code : this.generateCode();

    // Ensure status is a valid Enum string
    const validStatus = rest.status || "DRAFT"; 

    try {
        if (id) {
            // UPDATE
            console.log(`📝 UPDATING Question: ${id}`);
            return await this.prisma.question.update({
                where: { id },
                data: {
                    ...rest,
                    status: validStatus,
                    code: itemCode, 
                    type: rest.type || "MULTIPLE_CHOICE",
                    tags: tagsArray,
                    data: jsonPayload,
                },
            });
        } else {
            // CREATE
            console.log(`✨ CREATING New Question for User: ${userId} in Org: ${realOrgId}`);
            
            return await this.prisma.question.create({
                data: {
                    ...rest,
                    status: validStatus,
                    code: itemCode,
                    type: rest.type || "MULTIPLE_CHOICE",
                    tags: tagsArray,
                    data: jsonPayload,
                    
                    // 🚨 THE CRITICAL FIX: Connect to the variables we validated above
                    creator: { connect: { id: userId } },
                    organization: { connect: { id: realOrgId } } 
                },
            });
        }
    } catch (error) {
        // 🚨 LOG THE REAL ERROR TO TERMINAL
        console.error("🔥 DATABASE ERROR in QuestionsService:");
        console.error(error); 
        throw error;
    }
  }

  async findAll(params: { where?: Prisma.QuestionWhereInput; skip?: number; take?: number }) {
    const { where, skip, take } = params;
    return await this.prisma.question.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { fullName: true } } }
    });
  }

  async findOne(id: string) {
    return await this.prisma.question.findUnique({ where: { id } });
  }

  async remove(id: string) {
    return await this.prisma.question.delete({ where: { id } });
  }
}