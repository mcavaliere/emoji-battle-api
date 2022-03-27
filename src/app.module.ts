import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoundsController } from './rounds/rounds.controller';

@Module({
  imports: [],
  controllers: [AppController, RoundsController],
  providers: [AppService],
})
export class AppModule {}
