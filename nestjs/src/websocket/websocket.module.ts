import { Module, DynamicModule } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { AuthModule } from '../auth/auth.module';
import { ConnectorModule } from '../connector/connector.module';
import { ConfigModule } from '../config/config.module';
import { NoRestConfig } from '../norest-config.interface';
import { Connector } from '../connector/connector.interface';

@Module({
  imports: [AuthModule, ConnectorModule, ConfigModule],
  providers: [WebsocketGateway],
})
export class WebsocketModule {
  static async register(
    config: NoRestConfig,
    connector: Connector,
  ): Promise<DynamicModule> {
    return {
      module: WebsocketModule,
      providers: [WebsocketGateway],
      imports: [
        AuthModule.register(config),
        ConnectorModule.register(config, connector),
        ConfigModule.register(config),
      ],
    };
  }
}
