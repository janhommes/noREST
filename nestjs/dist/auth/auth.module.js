"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("./auth.guard");
const auth_service_1 = require("./auth.service");
const private_interceptor_1 = require("./interceptors/private.interceptor");
const reference_interceptor_1 = require("./interceptors/reference.interceptor");
const config_module_1 = require("../config/config.module");
let AuthModule = AuthModule_1 = class AuthModule {
    static async register(config) {
        return {
            module: AuthModule_1,
            imports: [config_module_1.ConfigModule.register(config)],
            providers: [
                auth_service_1.AuthService,
                auth_guard_1.AuthGuard,
                private_interceptor_1.PrivateInterceptor,
                reference_interceptor_1.ReferenceInterceptor,
            ],
            exports: [
                auth_service_1.AuthService,
                auth_guard_1.AuthGuard,
                private_interceptor_1.PrivateInterceptor,
                reference_interceptor_1.ReferenceInterceptor,
            ],
        };
    }
};
AuthModule = AuthModule_1 = __decorate([
    common_1.Module({
        imports: [config_module_1.ConfigModule],
        providers: [
            auth_service_1.AuthService,
            auth_guard_1.AuthGuard,
            private_interceptor_1.PrivateInterceptor,
            reference_interceptor_1.ReferenceInterceptor
        ],
        exports: [auth_service_1.AuthService, auth_guard_1.AuthGuard, private_interceptor_1.PrivateInterceptor, reference_interceptor_1.ReferenceInterceptor],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map