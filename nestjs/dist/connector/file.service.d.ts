import { Request } from 'express';
import { Observable } from 'rxjs';
import { ConnectorConfig } from './connector-config.interface';
import { Connector } from './connector.interface';
import { List } from './list.interface';
import { Reference } from './reference.interface';
export declare class FileService implements Connector {
    private readonly MAX_PAGE_SIZE;
    private readonly FILE_WATCH_INTERVAL;
    private path;
    private cachedData;
    private _readFile;
    private _writeFile;
    private watchers;
    private config;
    private watcher$;
    private getCollectionName;
    getData(): Promise<any>;
    saveData(data: any): Promise<void>;
    resolveCollection(req?: Request): Promise<string>;
    connect(config: ConnectorConfig): Promise<void>;
    private mapOperationType;
    isIndex(fragment: any): Promise<any>;
    create(data: any): Promise<any>;
    read(id: string): Promise<any>;
    readByKey(fragment: string, key: string): Promise<any>;
    list(skip: number, limit: number, orderBy?: string): Promise<{
        _: {
            total: any;
            skip: number;
            limit: number;
        };
        data: any;
    }>;
    listByIndexFragment(fragment: string, skip?: number, limit?: number, orderBy?: string): Promise<{
        _: {
            total: any;
            skip: number;
            limit: number;
        };
        data: any;
    }>;
    listByRef(references: Reference[], skip?: number, limit?: number, orderBy?: string): Promise<List>;
    update(id: string, data: any, partialData: any): Promise<any>;
    delete(id: string): Promise<any>;
    listenOnChanges(): Observable<any>;
    private order;
    private getPaged;
    private createId;
    private mapDiffToChangeset;
}
