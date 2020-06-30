import { ConnectorFactory, Connector, ConnectorRequest } from './connector.interface';
import { ConnectorConfig } from './connector-config.interface';
import { Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MockService } from './mock.service';
import { _ } from 'lodash';
import { Messages } from '../common/messages';

export class MockFactory implements ConnectorFactory {

  private static inMemoryData = {};

  async connect(config: ConnectorConfig) {
    try {
      Logger.log(`${config.name} connection established.`);
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async resolveConnector(
    req: ConnectorRequest,
    config: ConnectorConfig,
  ): Promise<Connector> {
    const collName = await MockFactory.getCollectionName(req, config);

    if (!MockFactory.inMemoryData[collName] && config.createCollectionNotExisting) {
      MockFactory.inMemoryData[collName] = [];
    } else if(!MockFactory.inMemoryData[collName]) {
      throw new HttpException(Messages.NO_COLLECTION, HttpStatus.NOT_FOUND);
    }

    const connector = new MockService();
    await connector.init(MockFactory.inMemoryData[collName]);
    return connector;
  }

  private static async getCollectionName(
    req: ConnectorRequest,
    config: ConnectorConfig,
  ) {
    if (_.isString(config.collection)) {
      return config.collection as string;
    }
    return (await (config.collection as Function)(req)) as string;
  }
}
