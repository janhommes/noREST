import { ConnectorFactory, Connector, ConnectorRequest } from './connector.interface';
import { ConnectorConfig } from './connector-config.interface';
import { Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MongoDbService } from './mongodb.service';
import { _ } from 'lodash';

export class MongoDbFactory implements ConnectorFactory {
  private client: MongoClient;
  async connect(config: ConnectorConfig) {
    try {
      this.client = await new MongoClient(config.url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();

      Logger.log(`${config.name} connection established at url: ${config.url}`);
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async resolveConnector(
    req: ConnectorRequest,
    config: ConnectorConfig,
  ): Promise<Connector> {
    const collName = await MongoDbFactory.getCollectionName(req, config);
    // TODO: add a cache here
    const connector = new MongoDbService();
    await connector.init(this.client, collName, config);
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
