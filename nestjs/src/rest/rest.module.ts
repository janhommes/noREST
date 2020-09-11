import { Module, DynamicModule } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RestController } from './rest.controller';
import { ConfigModule } from '../config/config.module';
import { ConnectorModule } from '../connector/connector.module';
import { NoRestConfig } from '../norest-config.interface';
import { ConnectorFactory } from '../connector/connector.interface';
import { RequestResponseInterceptor } from './request-response.interceptor';

@Module({
  imports: [AuthModule, ConfigModule, ConnectorModule],
  providers: [RequestResponseInterceptor],
  controllers: [RestController],
})
export class RestModule {
  static register(
    config: NoRestConfig,
    connector: ConnectorFactory,
  ): DynamicModule {
    return {
      module: RestModule,
      providers: [RequestResponseInterceptor],
      imports: [
        ConfigModule.register(config),
        AuthModule.register(config),
        ConnectorModule.register(config, connector),
      ],
      controllers: [RestController],
    };
  }
}
