import { Injectable, Inject } from '@nestjs/common';
import { Connector } from './connector.interface';
import {
  DB_CONNECTOR_TOKEN,
  DB_CONFIG_TOKEN,
  DB_CONNECTION_TOKEN,
} from '../common/constants';

@Injectable({})
export class ConnectorService {
  public database: Connector;
  constructor(
    @Inject(DB_CONNECTOR_TOKEN) connector: Connector,
  ) {
    this.database = connector;
  }
}
