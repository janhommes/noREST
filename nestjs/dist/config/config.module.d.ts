import { DynamicModule } from '@nestjs/common';
import { NoRestConfig } from '../norest-config.interface';
export declare class ConfigModule {
    static register(config: NoRestConfig): DynamicModule;
}
