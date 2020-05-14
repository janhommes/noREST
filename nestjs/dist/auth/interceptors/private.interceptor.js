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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const operators_1 = require("rxjs/operators");
const WebSocket = require("ws");
const constants_1 = require("../../common/constants");
const auth_service_1 = require("../auth.service");
let PrivateInterceptor = class PrivateInterceptor {
    constructor(auth) {
        this.auth = auth;
    }
    intercept(context, next) {
        let request = context.switchToHttp().getRequest();
        if (request instanceof WebSocket) {
            request = context.switchToWs().getData();
        }
        this.auth.authenticate(request);
        return next.handle().pipe(operators_1.map(values => {
            if (request.auth.isAuthenticated) {
                return values;
            }
            if (!values.data) {
                return this.omit(values);
            }
            values.data = values.data.map(value => this.omit(value));
            return values;
        }));
    }
    omit(value) {
        return lodash_1._.omitBy(value, (val, key) => key.startsWith(constants_1.DEFAULT_INDEX_FRAGMENT_PREFIX));
    }
};
PrivateInterceptor = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], PrivateInterceptor);
exports.PrivateInterceptor = PrivateInterceptor;
//# sourceMappingURL=private.interceptor.js.map