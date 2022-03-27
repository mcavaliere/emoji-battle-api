import { Controller, Get } from '@nestjs/common';
import { AppService } from '../app.service';

@Controller('rounds')
export class RoundsController {
  constructor(private readonly appService: AppService) {}

  @Get('/start')
  start(): string {
    return 'Round started.';
  }
}
