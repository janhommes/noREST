"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebsocketModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const websocket_gateway_1 = require("./websocket.gateway");
const auth_module_1 = require("../auth/auth.module");
const connector_module_1 = require("../connector/connector.module");
const config_module_1 = require("../config/config.module");
let WebsocketModule = WebsocketModule_1 = class WebsocketModule {
    static async register(config, connector) {
        return {
            module: WebsocketModule_1,
            providers: [websocket_gateway_1.WebsocketGateway],
            imports: [
                auth_module_1.AuthModule.register(config),
                connector_module_1.ConnectorModule.register(config, connector),
                config_module_1.ConfigModule.register(config),
            ],
        };
    }
};
WebsocketModule = WebsocketModule_1 = __decorate([
    common_1.Module({
        imports: [auth_module_1.AuthModule, connector_module_1.ConnectorModule, config_module_1.ConfigModule],
        providers: [websocket_gateway_1.WebsocketGateway],
    })
], WebsocketModule);
exports.WebsocketModule = WebsocketModule;
//# sourceMappingURL=websocket.module.js.map