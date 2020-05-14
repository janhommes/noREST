import { DynamicModule } from '@nestjs/common';
import { NoRestConfig } from '../norest-config.interface';
export declare class ConfigInitializerModule {
    static register(config?: NoRestConfig): Promise<DynamicModule>;
}
