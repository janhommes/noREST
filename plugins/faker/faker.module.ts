import { Module, DynamicModule } from '@nestjs/common';
import { FakerController } from './faker.controller';

@Module({})
export class FakerModule {
  static register() {
    return {
      module: FakerModule,
      controllers: [FakerController],
      providers: [],
    } as DynamicModule;
  }
}
