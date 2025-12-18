import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Prisma } from '@prisma/client';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(@Body() createQuestionDto: any) {
    // Pass explicit dummy IDs (would be JWT user in prod)
    const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";
    const DUMMY_ORG_ID = "11111111-1111-1111-1111-111111111111";
    return this.questionsService.create(createQuestionDto, DUMMY_USER_ID, DUMMY_ORG_ID);
  }

  @Get()
  findAll(
    @Query('page') page = '1', 
    @Query('limit') limit = '50',
    @Query('subject') subject?: string,
    @Query('grade') grade?: string,
    @Query('search') search?: string,
  ) {
    // Build Dynamic Query
    const where: Prisma.QuestionWhereInput = {};

    if (subject && subject !== 'ALL') {
        where.subject = subject;
    }

    if (grade && grade !== 'ALL') {
        // Since gradeLevels is an array, we use 'has'
        where.gradeLevels = { has: grade };
    }

    if (search) {
        // 🔍 SEARCH LOGIC: Text OR Tags OR Standard
        where.OR = [
            { text: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } }, // Searches inside the tags array
            { standards: { has: search } }
        ];
    }

    return this.questionsService.findAll({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // You might need to add findOne to service if not there
    // return this.questionsService.findOne(id);
    return {}; // Placeholder if service doesn't have it yet
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // Add remove method to service if needed
    return {}; 
  }
}