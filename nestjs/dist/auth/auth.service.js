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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const constants_1 = require("../common/constants");
const messages_1 = require("../common/messages");
let AuthService = class AuthService {
    constructor(authConfig) {
        this.authConfig = authConfig;
        this.isAuthenticated = false;
    }
    authenticate(request) {
        if (!request.auth) {
            const headers = request.headers;
            const jwt = this.getJwt(headers, request.query);
            request.auth = {
                isAuthenticated: !!jwt,
                user: jwt ? this.getUserFromJwt(jwt) : undefined,
            };
        }
    }
    getJwt(headers, query) {
        if (query && query[this.authConfig.cookieName]) {
            return this.getJwtContent(query[this.authConfig.cookieName]);
        }
        let authHeader = headers.authorization || headers.cookie;
        if (headers.cookie && !headers.authorization) {
            authHeader = this.getCookieByName(authHeader, this.authConfig.cookieName);
        }
        if (!authHeader) {
            return;
        }
        return this.getJwtContent(authHeader.replace(/Bearer /i, ''));
    }
    getUserFromJwt(jwt) {
        return jwt[this.authConfig.userProperty];
    }
    getCookieByName(cookies, name) {
        const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) {
            return match[2];
        }
        return;
    }
    getJwtContent(token) {
        if (token.split('.').length !== 3) {
            throw new common_1.HttpException(messages_1.Messages.INVALID_JWT, common_1.HttpStatus.UNAUTHORIZED);
        }
        try {
            return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        }
        catch (ex) {
            throw new common_1.HttpException(messages_1.Messages.INVALID_JWT, common_1.HttpStatus.UNAUTHORIZED);
        }
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(constants_1.NOREST_AUTH_CONFIG_TOKEN)),
    __metadata("design:paramtypes", [Object])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map