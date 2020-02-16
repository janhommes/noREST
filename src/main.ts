import { NestFactory } from '@nestjs/core';
import { NoRestModule } from './norest.module';

async function bootstrap() {
  const app = await NestFactory.create(NoRestModule);
  await app.listen(3000);
}
bootstrap();
