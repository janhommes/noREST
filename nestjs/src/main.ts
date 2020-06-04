import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { NoRestModule } from './norest.module';

async function bootstrap() {
  const app = await NestFactory.create(NoRestModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(3030);
}
bootstrap();
