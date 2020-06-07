import { MongoClient } from 'mongodb';
import { Connector } from './connector.interface';
import { ConnectorConfig } from './connector-config.interface';
import { Reference } from './reference.interface';
export declare class MongoDbService implements Connector {
    private collection;
    private indexFragments;
    private watcher$;
    init(client: MongoClient, collectionName: string, config: ConnectorConfig): Promise<void>;
    listenOnChanges(): any;
    private mapOperationType;
    isIndex(fragment: any): Promise<boolean>;
    create(data: any): Promise<any>;
    read(id: string): Promise<any>;
    readByKey(fragment: string, key: string): Promise<any>;
    list(skip: number, limit: number, orderBy?: string): Promise<{
        _: {
            total: number;
            skip: number;
            limit: number;
        };
        data: any[];
    }>;
    listByIndexFragment(fragment: string, skip: number, limit: number, orderBy?: string): Promise<{
        _: {
            total: number;
            skip: number;
            limit: number;
        };
        data: any[];
    }>;
    listByRef(references: Reference[], skip: number, limit: number, orderBy?: string): Promise<{
        _: {
            total: number;
            skip: number;
            limit: number;
        };
        data: any[];
    }>;
    update(id: string, data: any, partialData?: any): Promise<any>;
    delete(id: string): Promise<any>;
    private getIndexFragments;
    private setIndexFragments;
    private getObjectIdIfValid;
    private createSearchFilter;
}
