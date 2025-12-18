import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  create(@Body() createQuizDto: any) {
    // 👇 FIXED: Added Dummy IDs required by the updated Service
    const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";
    const DUMMY_ORG_ID = "11111111-1111-1111-1111-111111111111";
    return this.quizzesService.create(createQuizDto, DUMMY_USER_ID, DUMMY_ORG_ID);
  }

  @Get()
  findAll() {
    return this.quizzesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizDto: any) {
    return this.quizzesService.update(id, updateQuizDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizzesService.remove(id);
  }
}