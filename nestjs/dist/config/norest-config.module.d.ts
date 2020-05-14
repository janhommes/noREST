import { DynamicModule } from '@nestjs/common';
import { NoRestConfig } from '../norest-config.interface';
export declare class ConfigService {
    options: any;
    constructor(options: any);
}
export declare class NoRestConfigModule {
    static register(config?: Partial<NoRestConfig>): DynamicModule;
}
