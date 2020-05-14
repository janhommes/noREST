import { Connector } from './connector.interface';
import { ConnectorConfig } from './connector-config.interface';
import { Reference } from './reference.interface';
import { List } from './list.interface';
import { Observable } from 'rxjs';
export declare class MockService implements Connector {
    private readonly MAX_PAGE_SIZE;
    private data;
    private watcher$;
    resolveCollection(): void;
    connect(config: ConnectorConfig): void;
    isIndex(fragment: any): any;
    create(data: any): any;
    read(id: string): any;
    readByKey(fragment: string, key: string): Promise<any>;
    list(skip: number, limit: number, orderBy?: string): Promise<{
        _: {
            total: number;
            skip: number;
            limit: number;
        };
        data: any;
    }>;
    listByIndexFragment(fragment: string, skip?: number, limit?: number, orderBy?: string): Promise<{
        _: {
            total: number;
            skip: number;
            limit: number;
        };
        data: any;
    }>;
    listByRef(references: Reference[], skip?: number, limit?: number): Promise<List>;
    update(id: string, data: any, partialData: any): any;
    delete(id: string): any;
    listenOnChanges(): Observable<any>;
    private order;
    private getPaged;
    private createId;
}
