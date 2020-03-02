import { DbConnector } from './db-connector.enum';
import { Request } from 'express';

// TODO: separate DbConfig into specific FileDbConfig etc.
export interface DbConfig {
  name: 'mock' | 'mongodb' | 'file' | DbConnector;
  path?: string;
  url?: string;
  collection?: string | ((req: Request) => string);
  createCollectionNotExisting?: boolean;
}
