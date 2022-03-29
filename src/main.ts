import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  let app = await NestFactory.create(AppModule);

  // ConfigService isn't available until app.listen() is called; we start a temporary server
  //  to get the CLIENT_HOST from the environment, then close it.
  await app.listen(3001);
  const CLIENT_HOST = app.get(ConfigService).get('CLIENT_HOST');
  await app.close();

  if (!CLIENT_HOST) {
    throw new Error('CLIENT_HOST is not set.');
  }

  app = await NestFactory.create(AppModule, {
    cors: { origin: CLIENT_HOST, methods: ['GET', 'POST'] },
  });
  await app.listen(3001);
}
bootstrap();
