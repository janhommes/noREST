import { Module, DynamicModule } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({})
export class HealthModule {
  static register() {
    return {
      module: HealthModule,
      controllers: [HealthController],
      providers: [],
    } as DynamicModule;
  }
}
