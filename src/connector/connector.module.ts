import { Module, DynamicModule } from '@nestjs/common';
import { DbConfig } from './db-config.interface';
import { Connector } from './connector.interface';
import { ConnectorService } from './connector.service';
import { Provider } from '@nestjs/common/interfaces';
import { MockService } from './mock.service';
import { DbConnector } from './db-connector.enum';
import {
  DB_CONFIG_TOKEN,
  DB_CONNECTOR_TOKEN,
  DB_CONNECTION_TOKEN,
} from '../common/constants';
import { MongoDbService } from './mongodb.service';
import { FileService } from './file.service';

@Module({})
export class ConnectorModule {
  static getConnector(name: string, defaultConnector?) {
    if (!defaultConnector) {
      switch (name.toLowerCase()) {
        case DbConnector.Mock:
          return MockService;
        case DbConnector.MongoDB:
          return MongoDbService;
        case DbConnector.File:
          return FileService;
      }
    }
    return defaultConnector;
  }
  static register(
    provider: Provider<Connector>,
    options?: DbConfig,
  ): DynamicModule {
    return {
      module: ConnectorModule,
      providers: [
        {
          provide: DB_CONFIG_TOKEN,
          useValue: options,
        },
        {
          provide: DB_CONNECTOR_TOKEN,
          useExisting: provider,
        },
        {
          provide: DB_CONNECTION_TOKEN,
          useFactory: async (connector: Connector, config: DbConfig) => {
            const connection = await connector.connect(config);
            return connection;
          },
          inject: [DB_CONNECTOR_TOKEN, DB_CONFIG_TOKEN],
        },
        provider,
        ConnectorService,
      ],
      exports: [ConnectorService],
    };
  }
}
