import { Inject, Injectable } from '@nestjs/common';
import { DB_CONNECTOR_TOKEN } from '../common/constants';
import { Connector, ConnectorFactory } from './connector.interface';

@Injectable({})
export class ConnectorService {
  public connectorFactory: ConnectorFactory;
  constructor(
    @Inject(DB_CONNECTOR_TOKEN) factory: ConnectorFactory,
  ) {
    this.connectorFactory = factory;
  }
}
