import { Module, DynamicModule } from '@nestjs/common';
import { ConfigInitializerModule } from './config-initializer.module';
import { NoRestConfig } from '../norest-config.interface';

@Module({
  imports: [ConfigInitializerModule.register()],
  exports: [ConfigInitializerModule],
})
export class ConfigModule {
  static register(config: NoRestConfig): DynamicModule {
    return {
      module: ConfigModule,
      imports: [
        ConfigInitializerModule.register(config)
      ],
      exports: [
        ConfigInitializerModule
      ]
    }
  }
}
