import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  healthCheck() {
    return {
      status: 'ok',
      message: 'Project Eden API is running.',
      timestamp: new Date().toISOString(),
    };
  }
}
