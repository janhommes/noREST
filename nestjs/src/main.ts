import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { NoRestModule } from './norest.module';
import { DEFAULT_CONFIG } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(NoRestModule, { cors: DEFAULT_CONFIG.cors  });
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(DEFAULT_CONFIG.port);
}
bootstrap();
