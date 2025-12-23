import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  private generateCode() {
    return 'ITEM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  /**
   * Creates or Updates a Question and links it to an Organization and/or Passage.
   */
  async create(data: any, userId: string, orgIdFallback?: string) {
    
    // 🔍 STEP 1: Verify User and Organization
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true }
    });

    if (!user || !user.organizationId) {
        console.error("❌ SAVE FAILED: User or Organization not found for ID:", userId);
        throw new BadRequestException("User must belong to an Organization to create items.");
    }

    const realOrgId = user.organizationId;

    // 🔍 STEP 2: Extract data fields including passageId and reviewerNotes
    // 🛠️ FIX: Explicitly extract reviewerNotes from the incoming request
    const { id, options, tags, code, passageId, reviewerNotes, ...rest } = data;

    // Parse Tags safely
    let tagsArray: string[] = [];
    if (typeof tags === 'string' && tags.length > 0) {
        tagsArray = tags.split(',').map((t: string) => t.trim());
    } else if (Array.isArray(tags)) {
        tagsArray = tags;
    }

    // 🛠️ FIX: Update the JSON payload to store reviewerNotes separately
    const jsonPayload = { 
        options: options || [],
        reviewerNotes: reviewerNotes || null 
    };

    const itemCode = code && code.trim() !== '' ? code : this.generateCode();
    const validStatus = rest.status || "DRAFT";

    try {
        if (id) {
            // 📝 UPDATE existing Question
            console.log(`📝 UPDATING Question: ${id} with passageId: ${passageId || 'None'}`);
            return await this.prisma.question.update({
                where: { id },
                data: {
                    ...rest,
                    status: validStatus,
                    code: itemCode, 
                    type: rest.type || "MULTIPLE_CHOICE",
                    tags: tagsArray,
                    data: jsonPayload, // 🛠️ Persists the new reviewerNotes key
                    // 🔗 THE FIX: Explicitly connect/disconnect the passage relation
                    passage: passageId 
                        ? { connect: { id: passageId } } 
                        : (passageId === null ? { disconnect: true } : undefined),
                },
                include: { 
                    passage: true, // Returns full passage object to the UI
                    creator: { select: { fullName: true } }
                }
            });
        } else {
            // ✨ CREATE new Question
            console.log(`✨ CREATING New Question for User: ${userId} in Org: ${realOrgId}`);
            
            return await this.prisma.question.create({
                data: {
                    ...rest,
                    status: validStatus,
                    code: itemCode,
                    type: rest.type || "MULTIPLE_CHOICE",
                    tags: tagsArray,
                    data: jsonPayload, // 🛠️ Persists reviewerNotes on creation
                    creator: { connect: { id: userId } },
                    organization: { connect: { id: realOrgId } },
                    // 🔗 THE FIX: Link the passage if provided during creation
                    ...(passageId && { passage: { connect: { id: passageId } } })
                },
                include: { 
                    passage: true, 
                    creator: { select: { fullName: true } }
                }
            });
        }
    } catch (error) {
        console.error("🔥 DATABASE ERROR in QuestionsService:", error);
        throw error;
    }
  }

  /**
   * Returns all questions with their passage info and creator name.
   */
  async findAll(params: { where?: Prisma.QuestionWhereInput; skip?: number; take?: number }) {
    const { where, skip, take } = params;
    return await this.prisma.question.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
      include: { 
        creator: { select: { fullName: true } },
        // 🔗 THE PRESERVATION: Ensures the Item Bank list knows which passages are linked
        passage: { select: { id: true, title: true } } 
      }
    });
  }

  /**
   * Returns a single question with its full passage context.
   */
  async findOne(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
      include: {
        // 🔗 THE PRESERVATION: Loads the story content for the Editor
        passage: true, 
        creator: { select: { fullName: true } }
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.question.delete({ where: { id } });
  }
}