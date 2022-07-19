import { Injectable, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { CronJob } from 'cron';
import * as Ably from 'ably';

export const NUM_TICKS_IN_ROUND = 15;
export const TICK_DURATION = 1000;
export const CRON_JOB_NAME = 'TIMER';

@Module({
  imports: [ConfigModule],
})
@Injectable()
export class RoundsService {
  private websocket: Ably.Realtime;
  public readonly logger = new Logger(RoundsService.name);
  private cronjob: CronJob;
  private currentTick = 0;
  private currentRoundId: number;

  constructor(
    private configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
    private httpService: HttpService,
  ) {}

  public initWebsocket(): Ably.Realtime {
    if (!this.configService.get('ABLY_API_KEY')) {
      throw 'ABLY_API_KEY is not set.';
    }

    if (!this.websocket) {
      this.websocket = new Ably.Realtime(
        this.configService.get('ABLY_API_KEY'),
      );
    }

    return this.websocket;
  }

  tick: () => void = () => {
    this.currentTick++;
    const channel = this.websocket.channels.get('TIMER');

    if (this.currentTick <= NUM_TICKS_IN_ROUND) {
      this.logger.log(`Publishing tick:  `, this.currentTick);
      channel.publish('TICK', { number: this.currentTick });
    } else {
      this.logger.log('calling STOP()');
      this.stop();
    }
  };

  start(roundId: number): string {
    this.logger.log(`roundsService.start(${roundId})`);
    if (this.cronjob) {
      return 'Cronjob already running.';
    }

    this.currentRoundId = roundId;
    this.cronjob = new CronJob(CronExpression.EVERY_SECOND, () => this.tick());

    this.schedulerRegistry.addCronJob(CRON_JOB_NAME, this.cronjob);
    this.cronjob.start();

    const channel = this.websocket.channels.get('TIMER');
    channel.publish('ROUND_STARTED', {});

    return 'Started.';
  }

  async stop(): Promise<string> {
    this.logger.log(`roundsService.stop(${this.currentRoundId})`);

    const channel = this.websocket.channels.get('TIMER');
    const CLIENT_HOST = this.configService.get('CLIENT_HOST');
    const url = `${CLIENT_HOST}/api/rounds/${this.currentRoundId}/stop`;

    if (this.cronjob) {
      this.cronjob.stop();
      this.schedulerRegistry.deleteCronJob(CRON_JOB_NAME);
      delete this.cronjob;
      this.currentTick = 0;
    }

    this.logger.log('--------- posting to ', url);

    await this.httpService.axiosRef.post(url);

    channel.publish('ROUND_ENDED', {});
    return 'Stopped.';
  }
}
