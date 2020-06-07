import { DynamicModule } from '@nestjs/common';
import { NoRestConfig } from '../norest-config.interface';
import { ConnectorFactory } from '../connector/connector.interface';
export declare class WebsocketModule {
    static register(config: NoRestConfig, connector: ConnectorFactory): Promise<DynamicModule>;
}
