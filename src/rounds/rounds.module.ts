import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RoundsController } from './rounds.controller';
import { RoundsService } from './rounds.service';

@Module({
  imports: [ConfigModule],
  controllers: [RoundsController],
  providers: [RoundsService],
})
export class RoundsModule {
  constructor(private configService: ConfigService, private roundsService: RoundsService) {}
}
