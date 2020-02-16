import { DbConnector } from './db-connector.enum';
import { Request } from 'express';

export interface DbConfig {
  name: 'mock' | 'mongodb' | 'file' | DbConnector;
  url?: string;
  collection?: string | ((req: Request) => string);
}
