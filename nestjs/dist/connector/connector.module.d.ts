import { DynamicModule } from '@nestjs/common';
import { Connector } from './connector.interface';
import { NoRestConfig } from '../norest-config.interface';
export declare class ConnectorModule {
    static register(config: NoRestConfig, connector: Connector): DynamicModule;
}
