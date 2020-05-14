import { DynamicModule } from '@nestjs/common';
import { NoRestConfig } from '../norest-config.interface';
import { Connector } from '../connector/connector.interface';
export declare class WebsocketModule {
    static register(config: NoRestConfig, connector: Connector): Promise<DynamicModule>;
}
