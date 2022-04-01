import { Controller, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoundsService } from './rounds.service';

@Controller('rounds')
export class RoundsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly roundsService: RoundsService,
    private readonly logger = new Logger(RoundsController.name),
  ) {}

  @Post('/start')
  start(): string {
    console.log(`POST /rounds/start`);
    this.roundsService.initWebsocket();

    return this.roundsService.start();
  }

  @Post('/stop')
  stop(): string {
    console.log(`POST /rounds/stop`);
    this.roundsService.stop();

    return 'Round has been stopped';
  }
}
