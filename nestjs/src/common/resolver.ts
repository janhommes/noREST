import { ConnectorType } from '../connector/connector-type.enum';
import { ConnectorFactory } from '../connector/connector.interface';
import { MongoDbFactory } from '../connector/mongodb.factory';
import { FileFactory } from '../connector/file.factory';
import { MockFactory } from '../connector/mock.factory';

export function resolveConnector(name: string, defaultConnector?): ConnectorFactory {
  if (!defaultConnector) {
    switch (name.toLowerCase()) {
      case ConnectorType.Mock:
        return new MockFactory();
      case ConnectorType.MongoDB:
        return new MongoDbFactory();
      case ConnectorType.File:
        return new FileFactory();
    }
  }
  return defaultConnector;
}
