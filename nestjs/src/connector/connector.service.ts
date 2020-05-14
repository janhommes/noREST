import { Inject, Injectable } from '@nestjs/common';
import { DB_CONNECTOR_TOKEN } from '../common/constants';
import { Connector } from './connector.interface';

@Injectable({})
export class ConnectorService {
  public database: Connector;
  constructor(
    @Inject(DB_CONNECTOR_TOKEN) connector: Connector,
  ) {
    this.database = connector;
  }
}
