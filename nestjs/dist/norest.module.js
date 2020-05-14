"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NoRestModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const normalize_1 = require("./common/normalize");
const resolver_1 = require("./common/resolver");
const connector_module_1 = require("./connector/connector.module");
const rest_module_1 = require("./rest/rest.module");
const websocket_module_1 = require("./websocket/websocket.module");
const config_module_1 = require("./config/config.module");
let NoRestModule = NoRestModule_1 = class NoRestModule {
    static async forRoot(config, databaseConnector) {
        return NoRestModule_1.register(config, databaseConnector);
    }
    static async register(config, databaseConnector) {
        const noRestConfig = await normalize_1.normalizeConfig(config);
        const connector = resolver_1.resolveConnector(noRestConfig.connector.name, databaseConnector);
        return {
            module: NoRestModule_1,
            imports: [
                config_module_1.ConfigModule.register(noRestConfig),
                auth_module_1.AuthModule.register(noRestConfig),
                connector_module_1.ConnectorModule.register(noRestConfig, connector),
                rest_module_1.RestModule.register(noRestConfig, connector),
                websocket_module_1.WebsocketModule.register(noRestConfig, connector),
            ],
        };
    }
};
NoRestModule = NoRestModule_1 = __decorate([
    common_1.Module({
        imports: [auth_module_1.AuthModule, connector_module_1.ConnectorModule, rest_module_1.RestModule, websocket_module_1.WebsocketModule],
    })
], NoRestModule);
exports.NoRestModule = NoRestModule;
//# sourceMappingURL=norest.module.js.map