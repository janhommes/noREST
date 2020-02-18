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

export const createFakeData = async (apiController: ApiController, reqMock) => {
  const fakeData = [
    {
      _id: '1',
      name: 'position5',
      '#_user': {
        mail: 'smth@do.de',
      },
    },
    {
      _id: '2',
      name: 'position4',
      '#_product': {},
    },
    {
      _id: '3',
      name: 'position3',
      '#_product': {},
      // '@': [{ id: '7', fragment: '@_category' }],
    },
    {
      _id: '4',
      name: 'position2',
      '#_option': {
        name: 'api-key',
        internal: 'I am a secret :)',
      },
    },
    {
      _id: '5',
      name: 'position1',
      _key: 'test',
      '#_option': {
        name: 'api-key',
        internal: 'I am a secret :)',
      },
    },
    {
      _id: '7',
      name: 'position7',
      '#_category': {
        name: 'api-key',
        internal: 'I am a secret :)',
      },
      // '@': [{ id: '6', fragment: '@_category' }],
    },
    {
      _id: '6',
      name: 'position1',
      '#_category': {
        name: 'api-key',
        internal: 'I am a secret :)',
      },
      // '@': [{ id: '8', fragment: '@_product', oneToOne: true }],
    },
    {
      _id: '8',
      name: 'position8',
      '#_product': {},
    },
  ];
  for (const data of fakeData) {
    await apiController.create(data, reqMock);
  }
};

export const prepare = async () => {
  const apiConfig: ApiConfig = {
    db: {
      name: 'mock',
      url: '',
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
