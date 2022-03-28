import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoundsService } from './rounds.service';

@Controller('rounds')
export class RoundsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly roundsService: RoundsService,
  ) {}

  @Post('/start')
  start(): string {
    this.roundsService.initWebsocket();

    return this.roundsService.start();
  }
}
