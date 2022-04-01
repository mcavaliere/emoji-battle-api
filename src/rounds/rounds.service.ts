import { Injectable, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
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

  constructor(
    private configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
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
      channel.publish('ROUND_ENDED', {});
      this.stop();
    }
  };

  start(): string {
    if (this.cronjob) {
      return 'Cronjob already running.';
    }

    this.cronjob = new CronJob(CronExpression.EVERY_SECOND, () => this.tick());

    this.schedulerRegistry.addCronJob(CRON_JOB_NAME, this.cronjob);
    this.cronjob.start();

    const channel = this.websocket.channels.get('TIMER');
    channel.publish('ROUND_STARTED', {});

    return 'Started.';
  }

  stop(): string {
    if (this.cronjob) {
      this.cronjob.stop();
      this.schedulerRegistry.deleteCronJob(CRON_JOB_NAME);
      delete this.cronjob;
      this.currentTick = 0;
      return 'Stopped.';
    }

    return 'Cronjob not running.';
  }
}
