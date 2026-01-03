import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './infra/auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('v1/health')
  ping() {
    return { status: true };
  }
}
