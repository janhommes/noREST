import { Module, DynamicModule, Provider } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RestController } from './rest.controller';
import { ConfigModule } from '../config/config.module';
import { ConnectorModule } from '../connector/connector.module';
import { NoRestConfig } from '../norest-config.interface';
import { Connector } from '../connector/connector.interface';

@Module({
  imports: [AuthModule, ConfigModule, ConnectorModule],
  controllers: [RestController],
})
export class RestModule {
  static register(config: NoRestConfig, connector: Connector,): DynamicModule {
    return {
      module: RestModule,
      imports: [
        ConfigModule.register(config),
        AuthModule.register(config),
        ConnectorModule.register(config, connector),
      ],
      controllers: [RestController],
    };
  }
}
