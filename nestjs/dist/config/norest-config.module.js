"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NoRestConfigModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("../common/constants");
let ConfigService = class ConfigService {
    constructor(options) {
        this.options = options;
    }
};
ConfigService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(constants_1.NOREST_CONFIG_TOKEN)),
    __metadata("design:paramtypes", [Object])
], ConfigService);
exports.ConfigService = ConfigService;
let NoRestConfigModule = NoRestConfigModule_1 = class NoRestConfigModule {
    static register(config) {
        return {
            module: NoRestConfigModule_1,
            providers: [
                { provide: constants_1.NOREST_CONFIG_TOKEN, useValue: config },
                { provide: constants_1.NOREST_CONNECTOR_CONFIG_TOKEN, useValue: config.connector },
                { provide: constants_1.NOREST_REST_CONFIG_TOKEN, useValue: config.rest },
                { provide: constants_1.NOREST_AUTH_CONFIG_TOKEN, useValue: config.auth },
                { provide: constants_1.NOREST_WEBSOCKET_CONFIG_TOKEN, useValue: config.websocket },
                ConfigService
            ],
            exports: [
                constants_1.NOREST_AUTH_CONFIG_TOKEN
            ],
        };
    }
};
NoRestConfigModule = NoRestConfigModule_1 = __decorate([
    common_1.Module({})
], NoRestConfigModule);
exports.NoRestConfigModule = NoRestConfigModule;
//# sourceMappingURL=norest-config.module.js.map