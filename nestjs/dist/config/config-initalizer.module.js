"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConfigInitializerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("../common/constants");
const normalize_1 = require("../common/normalize");
let ConfigInitializerModule = ConfigInitializerModule_1 = class ConfigInitializerModule {
    static async register(config) {
        const noRestConfig = await normalize_1.normalizeConfig(config);
        return {
            module: ConfigInitializerModule_1,
            providers: [
                { provide: constants_1.NOREST_CONFIG_TOKEN, useValue: noRestConfig },
                {
                    provide: constants_1.NOREST_CONNECTOR_CONFIG_TOKEN,
                    useValue: noRestConfig.connector,
                },
                { provide: constants_1.NOREST_REST_CONFIG_TOKEN, useValue: noRestConfig.rest },
                { provide: constants_1.NOREST_AUTH_CONFIG_TOKEN, useValue: noRestConfig.auth },
                {
                    provide: constants_1.NOREST_WEBSOCKET_CONFIG_TOKEN,
                    useValue: noRestConfig.websocket,
                },
            ],
            exports: [
                constants_1.NOREST_CONFIG_TOKEN,
                constants_1.NOREST_CONNECTOR_CONFIG_TOKEN,
                constants_1.NOREST_REST_CONFIG_TOKEN,
                constants_1.NOREST_AUTH_CONFIG_TOKEN,
                constants_1.NOREST_WEBSOCKET_CONFIG_TOKEN,
            ],
        };
    }
};
ConfigInitializerModule = ConfigInitializerModule_1 = __decorate([
    common_1.Module({})
], ConfigInitializerModule);
exports.ConfigInitializerModule = ConfigInitializerModule;
//# sourceMappingURL=config-initalizer.module.js.map