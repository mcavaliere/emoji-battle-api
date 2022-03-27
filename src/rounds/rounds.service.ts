import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Ably from 'ably';

export const NUM_TICKS_IN_ROUND = 5;
export const TICK_DURATION = 1000;

@Module({
  imports: [ConfigModule],
})
@Injectable()
export class RoundsService {
  private websocket: Ably.Realtime;

  constructor(private configService: ConfigService) {}

  public initWebsocket(): Ably.Realtime {
    if (!this.configService.get('ABLY_API_KEY')) {
      throw 'ABLY_API_KEY is not set.';
    }

    if (!this.websocket) {
      this.websocket = new Ably.Realtime(this.configService.get('ABLY_API_KEY'));
    }

    return this.websocket;
  }

  start(): string {
    const channel = this.websocket.channels.get('TIMER');
    channel.publish('TICK', { number: 20 });
    return 'Started.';
  }
}
