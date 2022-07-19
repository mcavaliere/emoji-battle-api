import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoundsService } from './rounds.service';

@Controller('rounds')
export class RoundsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly roundsService: RoundsService,
  ) {}

  @Post('/start')
  start(@Body('roundId') roundId: number): string {
    this.roundsService.logger.log(`POST /rounds/start`);
    this.roundsService.initWebsocket();

    return this.roundsService.start(roundId);
  }

  @Post('/stop')
  stop(): string {
    this.roundsService.logger.log(`POST /rounds/stop`);
    this.roundsService.stop();

    return 'Round has been stopped';
  }
}
