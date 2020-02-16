import { ApiConfig } from '../../api/api-config.interface';
import { Test } from '@nestjs/testing';
import { ApiController } from '../../api/api.controller';
import {
  API_CONFIG_TOKEN,
  DB_CONFIG_TOKEN,
  DB_CONNECTOR_TOKEN,
  DB_CONNECTION_TOKEN,
} from '../../common/constants';
import { AuthService } from '../../api/auth.service';
import { AuthGuard } from '../../api/auth.guard';
import { MockService } from '../../connector/mock.service';
import { MongoDbService } from '../../connector/mongodb.service';
import { ConnectorService } from '../../connector/connector.service';
import { Connector } from '../../connector/connector.interface';
import { DbConfig } from '../../connector/db-config.interface';

export const prepare = async () => {
  const apiConfig: ApiConfig = {
    db: {
      name: 'mongodb',
      url: 'mongodb://127.0.0.1:27017/test',
      collection: 'delete_me',
    },
    config: {
      auth: {
        userProperty: 'sub',
        cookieName: 'auth',
        jwtValidation: false,
        mode: '',
        secret: '',
      },
      baseRoute: 'api',
      fixed: false,
    },
  };

  const module = await Test.createTestingModule({
    controllers: [ApiController],
    providers: [
      {
        provide: API_CONFIG_TOKEN,
        useValue: apiConfig,
      },
      {
        provide: DB_CONFIG_TOKEN,
        useValue: apiConfig.db,
      },
      AuthService,
      AuthGuard,
      MockService,
      MongoDbService,
      ConnectorService,
      {
        provide: DB_CONNECTOR_TOKEN,
        useExisting: MockService,
      },
      {
        provide: DB_CONNECTION_TOKEN,
        useFactory: async (connector: Connector, config: DbConfig) => {
          const connection = await connector.connect(config);
          return connection;
        },
        inject: [DB_CONNECTOR_TOKEN, DB_CONFIG_TOKEN],
      },
    ],
  }).compile();

  return { module };
};
