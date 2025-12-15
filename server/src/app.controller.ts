import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // New Health Check Endpoint
  @Get('health')
  getHealth(): object {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }
}