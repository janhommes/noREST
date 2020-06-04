import { DynamicModule } from '@nestjs/common';
import { Connector } from './connector/connector.interface';
import { NoRestConfig } from './norest-config.interface';
export declare class NoRestModule {
    static forRoot(config?: Partial<NoRestConfig>, databaseConnector?: Connector): Promise<DynamicModule>;
    static register(config?: Partial<NoRestConfig>, databaseConnector?: Connector): Promise<DynamicModule>;
}
