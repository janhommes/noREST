import { DynamicModule } from '@nestjs/common';
import { ConnectorFactory } from './connector/connector.interface';
import { NoRestConfig } from './norest-config.interface';
export declare class NoRestModule {
    static forRoot(config?: Partial<NoRestConfig>, databaseConnector?: ConnectorFactory): Promise<DynamicModule>;
    static register(config?: Partial<NoRestConfig>, databaseConnector?: ConnectorFactory): Promise<DynamicModule>;
}
