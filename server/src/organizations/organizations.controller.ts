import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { Prisma } from '@prisma/client';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  create(@Body() createDto: Prisma.OrganizationCreateInput) {
    return this.organizationsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }
}