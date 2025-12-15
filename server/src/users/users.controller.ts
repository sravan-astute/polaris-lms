import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport'; // <--- Import the Guard

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Anyone can create a user (for now)
  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.createUser(createUserDto);
  }

  // 🔒 THIS ROUTE IS NOW LOCKED 🔒
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}