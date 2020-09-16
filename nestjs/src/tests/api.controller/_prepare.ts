import { Test } from '@nestjs/testing';
import { ConnectorType } from 'nestjs/src/connector/connector-type.enum';
import { AuthGuard } from '../../auth/auth.guard';
import { AuthService } from '../../auth/auth.service';
import {
  DB_CONNECTION_TOKEN,
  DB_CONNECTOR_TOKEN,
  NOREST_CONFIG_TOKEN,
  NOREST_CONNECTOR_CONFIG_TOKEN,
} from '../../common/constants';
import { ConnectorConfig } from '../../connector/connector-config.interface';
import { Connector, ConnectorFactory } from '../../connector/connector.interface';
import { ConnectorService } from '../../connector/connector.service';
import { FileService } from '../../connector/file.service';
import { MockService } from '../../connector/mock.service';
import { MongoDbService } from '../../connector/mongodb.service';
import { NoRestConfig } from '../../norest-config.interface';
import { RestController } from '../../rest/rest.controller';
import { MockFactory } from '../../connector/mock.factory';
import { ConfigInitializerModule } from '../../config/config-initializer.module';

export const createFakeData = async (
  restController: RestController,
  reqMock,
) => {
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
    try {
      await restController.create(data, reqMock);
    } catch (ex) {
      console.log(ex);
    }
  }
};

export const prepare = async () => {
  const config: NoRestConfig = {
    connector: {
      name: ConnectorType.Mock,
      url: 'mongodb://127.0.0.1:27017/test',
      collection: 'testme_' + Math.random(),
      path: '../../dist/test',
      createCollectionNotExisting: true,
    },
    auth: {
      userProperty: 'sub',
      cookieName: 'auth',
    },
    rest: {
      defaultPageSize: 100
    },
    websocket: {
      enabled: true,
    },
    path: 'api',
    fixed: false,
    cors: true,
    port: 3030
  };

  const module = await Test.createTestingModule({
    controllers: [RestController],
    imports: [
      ConfigInitializerModule.register(config)
    ],
    providers: [
      {
        provide: NOREST_CONFIG_TOKEN,
        useValue: config,
      },
      {
        provide: NOREST_CONNECTOR_CONFIG_TOKEN,
        useValue: config.connector,
      },
      AuthService,
      AuthGuard,
      MockService,
      MongoDbService,
      ConnectorService,
      FileService,
      {
        provide: DB_CONNECTOR_TOKEN,
        useFactory: () => new MockFactory(),
      },
      {
        provide: DB_CONNECTION_TOKEN,
        useFactory: async (connector: ConnectorFactory, config: ConnectorConfig) => {
          const connection = await connector.connect(config);
          return connection;
        },
        inject: [DB_CONNECTOR_TOKEN, NOREST_CONNECTOR_CONFIG_TOKEN],
      },
    ],
  }).compile();

  return { module };
};
