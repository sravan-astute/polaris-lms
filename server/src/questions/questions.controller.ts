import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards, Request } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto'; 

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto, @Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    // This calls the service which now handles the passage connection 
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
    if (grade && grade !== 'ALL') where.gradeLevels = { has: grade };
    
    if (search) {
        where.OR = [
            { text: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
            { standards: { has: search } }
        ];
    }

    // This calls the service which now includes the passage relation 
    return this.questionsService.findAll({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Returns full question data + linked passage content [cite: 256, 261]
    return this.questionsService.findOne(id);
  }
  
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: CreateQuestionDto, @Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    
    // Passing the ID ensures the service performs an update rather than a new create 
    return this.questionsService.create({ ...updateQuestionDto, id }, userId, undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}