import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto'; // 👈 IMPORT THE DTO

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto, @Request() req: any) {
    // 1. Get Real User ID from JWT
    const userId = req.user.userId || req.user.sub;
    
    // 2. We pass 'undefined' for the fallback Org ID. 
    // Your Service layer (questions.service.ts) already looks up the 
    // real Organization ID from the User table, so we don't need to hardcode it here.
    return this.questionsService.create(createQuestionDto, userId, undefined);
  }

  @Get()
  findAll(
    @Query('page') page = '1', 
    @Query('limit') limit = '50',
    @Query('subject') subject?: string,
    @Query('grade') grade?: string,
    @Query('search') search?: string,
  ) {
    const where: Prisma.QuestionWhereInput = {};

    if (subject && subject !== 'ALL') where.subject = subject;
    // Note: Ensure gradeLevels is treated as an array in your schema
    if (grade && grade !== 'ALL') where.gradeLevels = { has: grade };
    
    if (search) {
        where.OR = [
            { text: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
            { standards: { has: search } } // If standards is an array
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
    return this.questionsService.findOne(id);
  }
  
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: CreateQuestionDto, @Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    
    // Reuse the create logic (Upsert pattern) but include the ID so it updates instead of creates
    return this.questionsService.create({ ...updateQuestionDto, id }, userId, undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}