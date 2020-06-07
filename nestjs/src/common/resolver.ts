import { ConnectorType } from '../connector/connector-type.enum';
import { ConnectorFactory } from '../connector/connector.interface';
import { MongoDbFactory } from '../connector/mongodb.factory';

export function resolveConnector(name: string, defaultConnector?): ConnectorFactory {
  if (!defaultConnector) {
    switch (name.toLowerCase()) {
      //case ConnectorType.Mock:
        //return new MockService();
      case ConnectorType.MongoDB:
        return new MongoDbFactory();
      //case ConnectorType.File:
        //return new FileService();
    }
  }
  return defaultConnector;
}
