import { NoRestConfig } from './norest-config.interface';
export declare class ConfigModule {
    static register(config?: NoRestConfig): {
        module: typeof ConfigModule;
        providers: ({
            provide: string;
            useValue: NoRestConfig;
        } | {
            provide: string;
            useValue: import("./public_api").ConnectorConfig;
        } | {
            provide: string;
            useValue: import("./public_api").RestConfig;
        } | {
            provide: string;
            useValue: import("./auth/auth-config.interface").AuthConfig;
        } | {
            provide: string;
            useValue: import("./websocket/websocket-config.interface").WebsocketConfig;
        })[];
        exports: string[];
    };
}
