import { Controller, Post, Body, Res } from '@nestjs/common';
import { LtiService } from './lti.service';
// 👇 FIXED: Added 'type' keyword to satisfy the compiler
import type { Response } from 'express'; 

@Controller('lti')
export class LtiController {
  constructor(private readonly ltiService: LtiService) {}

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    const result = await this.ltiService.validateAndLogin(body); 
    return res.json(result);
  }
    
  @Post('launch')
  async launch(@Body() body: any, @Res() res: Response) {
      const result = await this.ltiService.validateAndLogin(body); 
      return res.json(result);
  }
}