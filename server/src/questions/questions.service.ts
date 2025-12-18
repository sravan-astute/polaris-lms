import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  // 🛠️ HELPER: Auto-creates Dummy User/Org if missing
  private async ensureDefaults() {
    const ORG_ID = "11111111-1111-1111-1111-111111111111";
    const USER_ID = "00000000-0000-0000-0000-000000000000";

    await this.prisma.organization.upsert({
        where: { id: ORG_ID },
        update: {},
        create: { id: ORG_ID, name: "Polaris Demo School", domain: "polaris.edu" }
    });

    await this.prisma.user.upsert({
        where: { id: USER_ID },
        update: {},
        create: { id: USER_ID, email: "admin@polaris.edu", fullName: "Demo Admin", organizationId: ORG_ID }
    });

    return { ORG_ID, USER_ID };
  }

  async create(data: any, _userId: string, _orgId: string) {
    const { USER_ID, ORG_ID } = await this.ensureDefaults();

    // 1. CLEANUP: Separate relation fields and unneeded fields
    // We remove 'points' (it's in the Quiz now) and 'id' (we check it separately)
    const { options, tags, points, id, ...rest } = data; 
    
    // 2. PARSE TAGS: (String "math, geometry" -> Array ["math", "geometry"])
    let tagsArray: string[] = [];
    if (typeof tags === 'string' && tags.length > 0) {
        tagsArray = tags.split(',').map((t: string) => t.trim());
    } else if (Array.isArray(tags)) {
        tagsArray = tags;
    }

    // 3. DEFAULTS
    const questionType = rest.type || "MULTIPLE_CHOICE";

    // 4. PREPARE OPTION DATA (Common for Create and Update)
    // We map the incoming options to the Prisma format
    const optionsData = options.map((opt: any) => ({
        text: opt.text || "",
        isCorrect: !!opt.isCorrect,
        feedback: opt.feedback || null,
    }));

    try {
        // 👉 SCENARIO A: UPDATE (If ID exists)
        if (id) {
            console.log(`🔄 Updating Question: ${id}`);
            return await this.prisma.question.update({
                where: { id },
                data: {
                    ...rest,
                    type: questionType,
                    tags: tagsArray,
                    // For relations in an update, we delete old options and re-create new ones
                    // This ensures deleted options are actually removed.
                    options: {
                        deleteMany: {}, 
                        create: optionsData,
                    },
                },
                include: { options: true },
            });
        } 
        
        // 👉 SCENARIO B: CREATE (If ID is missing or null)
        else {
            console.log(`✨ Creating New Question`);
            return await this.prisma.question.create({
                data: {
                    ...rest,
                    type: questionType,
                    tags: tagsArray,
                    creatorId: USER_ID,
                    organizationId: ORG_ID,
                    options: {
                        create: optionsData,
                    },
                },
                include: { options: true },
            });
        }

    } catch (error) {
        console.error("🔥 DATABASE ERROR:", error);
        throw error;
    }
  }

  async findAll(params: { where?: Prisma.QuestionWhereInput; skip?: number; take?: number }) {
    const { where, skip, take } = params;
    
    const data = await this.prisma.question.findMany({
      skip,
      take,
      where,
      include: { options: true }, 
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.question.count({ where });

    return { data, total };
  }
}