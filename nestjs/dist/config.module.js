"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConfigModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("./common/constants");
let ConfigModule = ConfigModule_1 = class ConfigModule {
    static register(config) {
        return {
            module: ConfigModule_1,
            providers: [
                { provide: constants_1.NOREST_CONFIG_TOKEN, useValue: config },
                {
                    provide: constants_1.NOREST_CONNECTOR_CONFIG_TOKEN,
                    useValue: config.connector,
                },
                { provide: constants_1.NOREST_REST_CONFIG_TOKEN, useValue: config.rest },
                { provide: constants_1.NOREST_AUTH_CONFIG_TOKEN, useValue: config.auth },
                {
                    provide: constants_1.NOREST_WEBSOCKET_CONFIG_TOKEN,
                    useValue: config.websocket,
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
ConfigModule = ConfigModule_1 = __decorate([
    common_1.Module({})
], ConfigModule);
exports.ConfigModule = ConfigModule;
//# sourceMappingURL=config.module.js.map