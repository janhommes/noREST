import { ConnectorFactory, Connector, ConnectorRequest } from './connector.interface';
import { ConnectorConfig } from './connector-config.interface';
import { Logger } from '@nestjs/common';
import { FileService } from './file.service';
import { _ } from 'lodash';

export class FileFactory implements ConnectorFactory {
  async connect(config: ConnectorConfig) {
    try {
      Logger.log(`${config.name} connection established at path: ${config.path}`);
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async resolveConnector(
    req: ConnectorRequest,
    config: ConnectorConfig,
  ): Promise<Connector> {
    const collName = await FileFactory.getCollectionName(req, config);
    // TODO: add a cache here
    const connector = new FileService();
    await connector.init(config, collName);
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
