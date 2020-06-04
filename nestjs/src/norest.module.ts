import { DynamicModule, Module, Provider, Logger } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { normalizeConfig } from './common/normalize';
import { resolveConnector } from './common/resolver';
import { Connector } from './connector/connector.interface';
import { ConnectorModule } from './connector/connector.module';
import { NoRestConfig } from './norest-config.interface';
import { RestModule } from './rest/rest.module';
import { WebsocketModule } from './websocket/websocket.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [AuthModule, ConnectorModule, RestModule, WebsocketModule],
})
export class NoRestModule {
  static async forRoot(
    config?: Partial<NoRestConfig>,
    databaseConnector?: Connector,
  ): Promise<DynamicModule> {
    return NoRestModule.register(config, databaseConnector);
  }

  static async register(
    config?: Partial<NoRestConfig>,
    databaseConnector?: Connector,
  ): Promise<DynamicModule> {
    const noRestConfig = await normalizeConfig(config);
    const connector = resolveConnector(
      noRestConfig.connector.name,
      databaseConnector,
    );
    return {
      module: NoRestModule,
      imports: [
        ConfigModule.register(noRestConfig),
        AuthModule.register(noRestConfig),
        ConnectorModule.register(noRestConfig, connector),
        RestModule.register(noRestConfig, connector),
        WebsocketModule.register(noRestConfig, connector),
      ],
    };
  }
}
