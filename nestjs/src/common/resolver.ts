import { ConnectorType } from '../connector/connector-type.enum';
import { MockService } from '../connector/mock.service';
import { MongoDbService } from '../connector/mongodb.service';
import { FileService } from '../connector/file.service';
import { Connector } from '../connector/connector.interface';

export function resolveConnector(name: string, defaultConnector?): Connector {
  if (!defaultConnector) {
    switch (name.toLowerCase()) {
      case ConnectorType.Mock:
        return new MockService();
      case ConnectorType.MongoDB:
        return new MongoDbService();
      case ConnectorType.File:
        return new FileService();
    }
  }
  return defaultConnector;
}
