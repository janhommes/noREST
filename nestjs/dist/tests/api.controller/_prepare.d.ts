import { RestController } from '../../rest/rest.controller';
export declare const createFakeData: (restController: RestController, reqMock: any) => Promise<void>;
export declare const prepare: () => Promise<{
    module: import("@nestjs/testing").TestingModule;
}>;
