import { Controller, Get, Post, Body, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { PassagesService } from './passages.service';
import { CreatePassageDto } from './dto/create-passage.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('passages')
@UseGuards(JwtAuthGuard) // Protect all endpoints
export class PassagesController {
  constructor(private readonly passagesService: PassagesService) {}

  @Post()
  // 👇 FIX: Added ': any' to req
  create(@Body() createPassageDto: CreatePassageDto, @Request() req: any) {
    // Pass the User ID so we can link it to their Organization
    return this.passagesService.create(createPassageDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.passagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.passagesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.passagesService.remove(id);
  }
}