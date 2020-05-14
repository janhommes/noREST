"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RestModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const rest_controller_1 = require("./rest.controller");
const config_module_1 = require("../config/config.module");
const connector_module_1 = require("../connector/connector.module");
let RestModule = RestModule_1 = class RestModule {
    static register(config, connector) {
        return {
            module: RestModule_1,
            imports: [
                config_module_1.ConfigModule.register(config),
                auth_module_1.AuthModule.register(config),
                connector_module_1.ConnectorModule.register(config, connector),
            ],
            controllers: [rest_controller_1.RestController],
        };
    }
};
RestModule = RestModule_1 = __decorate([
    common_1.Module({
        imports: [auth_module_1.AuthModule, config_module_1.ConfigModule, connector_module_1.ConnectorModule],
        controllers: [rest_controller_1.RestController],
    })
], RestModule);
exports.RestModule = RestModule;
//# sourceMappingURL=rest.module.js.map