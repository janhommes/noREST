import { DynamicModule } from '@nestjs/common';
import { ConnectorFactory } from './connector.interface';
import { NoRestConfig } from '../norest-config.interface';
export declare class ConnectorModule {
    static register(config: NoRestConfig, connector: ConnectorFactory): DynamicModule;
}
