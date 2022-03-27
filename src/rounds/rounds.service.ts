import { Injectable } from '@nestjs/common';

@Injectable()
export class RoundsService {
  start(): string {
    return 'Hello World!';
  }
}
