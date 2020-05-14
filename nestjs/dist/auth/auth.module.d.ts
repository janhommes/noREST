import { DynamicModule } from '@nestjs/common';
import { NoRestConfig } from '../norest-config.interface';
export declare class AuthModule {
    static register(config?: NoRestConfig): Promise<DynamicModule>;
}
