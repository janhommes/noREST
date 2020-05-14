import { ConnectorType } from './connector-type.enum';
import { Request } from 'express';
export interface ConnectorConfig {
    name: ConnectorType;
    path?: string;
    url?: string;
    collection?: string | ((req?: Request) => string);
    createCollectionNotExisting?: boolean;
}
