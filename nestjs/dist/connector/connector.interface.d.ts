import { ConnectorConfig } from './connector-config.interface';
import { Request } from 'express';
import { List } from './list.interface';
import { Reference } from './reference.interface';
import { Observable } from 'rxjs';
import { Changeset } from '../websocket/changeset.interface';
export interface Connector {
    connect(config: ConnectorConfig): any;
    resolveCollection(req: Request): any;
    isIndex(fragment: any): any;
    read(id: string): any;
    readByKey(fragment: string, key: string): any;
    list(skip: number, limit: number, orderBy?: string): Promise<List>;
    listByIndexFragment(fragment: string, skip: number, limit: number, orderBy?: string): Promise<List>;
    listByRef(references: Reference[], skip: number, limit: number, orderBy?: string): Promise<List>;
    create(data: any): any;
    update(id: string, data: any, partialData?: any): any;
    delete(id: string): any;
    listenOnChanges(fragment?: any, id?: any, ref?: any): Observable<Changeset>;
}
