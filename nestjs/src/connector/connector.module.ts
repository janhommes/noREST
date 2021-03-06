import { DynamicModule, Module, Provider, Inject } from '@nestjs/common';
import {
  DB_CONNECTOR_TOKEN,
  NOREST_CONNECTOR_CONFIG_TOKEN,
  DB_CONNECTION_TOKEN,
  CONNECTOR_CONFIG_DEFAULTS,
} from '../common/constants';
import { resolveConnector } from '../common/resolver';
import { ConfigModule } from '../config/config.module';
import { ConnectorConfig } from './connector-config.interface';
import { Connector, ConnectorFactory } from './connector.interface';
import { ConnectorService } from './connector.service';
import { NoRestConfig } from '../norest-config.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DB_CONNECTOR_TOKEN,
      useFactory: (config: ConnectorConfig) => {
        return resolveConnector(config.name);
      },
      inject: [NOREST_CONNECTOR_CONFIG_TOKEN],
    },
    {
      provide: DB_CONNECTION_TOKEN,
      useFactory: async (connector: ConnectorFactory, config: ConnectorConfig) => {
        const connection = await connector.connect(config);
        return connection;
      },
      inject: [DB_CONNECTOR_TOKEN, NOREST_CONNECTOR_CONFIG_TOKEN],
    },
    ConnectorService,
  ],
  exports: [ConnectorService],
})
export class ConnectorModule {
  static register(config: NoRestConfig, connector: ConnectorFactory): DynamicModule {
    return {
      module: ConnectorModule,
      imports: [ConfigModule.register(config)],
      providers: [
        {
          provide: DB_CONNECTOR_TOKEN,
          useFactory: () => {
            return resolveConnector(config.connector.name, connector);
          }
        },
        {
          provide: DB_CONNECTION_TOKEN,
          useFactory: async (connector: ConnectorFactory) => {
            const client = await connector.connect(config.connector);
            return client;
          },
          inject: [DB_CONNECTOR_TOKEN],
        },
        ConnectorService,
      ],
      exports: [ConnectorService],
    };
  }
}
