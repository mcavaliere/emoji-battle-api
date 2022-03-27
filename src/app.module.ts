import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoundsModule } from './rounds/rounds.module';

@Module({
  imports: [ConfigModule.forRoot(), RoundsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
