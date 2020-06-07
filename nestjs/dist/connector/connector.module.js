"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ConnectorModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("../common/constants");
const resolver_1 = require("../common/resolver");
const config_module_1 = require("../config/config.module");
const connector_service_1 = require("./connector.service");
let ConnectorModule = ConnectorModule_1 = class ConnectorModule {
    static register(config, connector) {
        return {
            module: ConnectorModule_1,
            imports: [config_module_1.ConfigModule.register(config)],
            providers: [
                {
                    provide: constants_1.DB_CONNECTOR_TOKEN,
                    useFactory: () => {
                        return resolver_1.resolveConnector(config.connector.name, connector);
                    }
                },
                {
                    provide: constants_1.DB_CONNECTION_TOKEN,
                    useFactory: async (connector) => {
                        const client = await connector.connect(config.connector);
                        return client;
                    },
                    inject: [constants_1.DB_CONNECTOR_TOKEN],
                },
                connector_service_1.ConnectorService,
            ],
            exports: [connector_service_1.ConnectorService],
        };
    }
};
ConnectorModule = ConnectorModule_1 = __decorate([
    common_1.Module({
        imports: [config_module_1.ConfigModule],
        providers: [
            {
                provide: constants_1.DB_CONNECTOR_TOKEN,
                useFactory: (config) => {
                    return resolver_1.resolveConnector(config.name);
                },
                inject: [constants_1.NOREST_CONNECTOR_CONFIG_TOKEN],
            },
            {
                provide: constants_1.DB_CONNECTION_TOKEN,
                useFactory: async (connector, config) => {
                    const connection = await connector.connect(config);
                    return connection;
                },
                inject: [constants_1.DB_CONNECTOR_TOKEN, constants_1.NOREST_CONNECTOR_CONFIG_TOKEN],
            },
            connector_service_1.ConnectorService,
        ],
        exports: [connector_service_1.ConnectorService],
    })
], ConnectorModule);
exports.ConnectorModule = ConnectorModule;
//# sourceMappingURL=connector.module.js.map