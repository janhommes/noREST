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
const core_1 = require("@nestjs/core");
const websockets_1 = require("@nestjs/websockets");
const lodash_1 = require("lodash");
const fetch = require("node-fetch");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const Ws = require("ws");
const constants_1 = require("../common/constants");
const normalize_1 = require("../common/normalize");
const connector_service_1 = require("../connector/connector.service");
const private_interceptor_1 = require("../auth/interceptors/private.interceptor");
const reference_interceptor_1 = require("../auth/interceptors/reference.interceptor");
let WebsocketGateway = class WebsocketGateway {
    constructor(connector, noRestConfig, httpServerRef, privateDataInterceptor) {
        this.noRestConfig = noRestConfig;
        this.httpServerRef = httpServerRef;
        this.privateDataInterceptor = privateDataInterceptor;
        this.database = connector.connectorFactory;
    }
    async handleConnection(client, msg) {
        const url = new URL(msg.url, `http://${msg.headers.host}`);
        const sub = {
            event: 'subscribe',
            data: {
                channel: `${url.origin}${msg.url}`,
                headers: msg.headers,
            },
        };
        setTimeout(() => {
            client.emit('message', JSON.stringify(sub));
        });
    }
    async onEvent(client, eventDate) {
        const { channel, headers } = eventDate;
        const url = new URL(channel, `http://${headers.host}`);
        const pathParts = url.pathname.split('/');
        const baseIndex = pathParts.indexOf(pathParts.find(path => path === this.noRestConfig.path));
        const fragment = pathParts[baseIndex + 1];
        const id = pathParts[baseIndex + 2];
        const ref = pathParts[baseIndex + 3];
        delete headers.upgrade;
        const dbClient = await this.database.resolveConnector({ url: url.toString(), headers }, this.noRestConfig.connector);
        return rxjs_1.from(fetch(channel, { headers })).pipe(operators_1.mergeMap((res) => res.json()), operators_1.map(response => {
            if (response.statusCode) {
                return Object.assign(Object.assign({}, response), { method: 'GET', channel });
            }
            return Object.assign(Object.assign({}, response), { _: Object.assign(Object.assign({}, response._), { method: 'GET', channel }) });
        }), operators_1.mergeMap(response => {
            if (response.statusCode) {
                return rxjs_1.of(response);
            }
            return dbClient
                .listenOnChanges(normalize_1.normalizeFragment(fragment), id, ref)
                .pipe(operators_1.startWith({}), operators_1.map((change) => {
                if (response._id && response._id === change._id) {
                    return this.resolveDetailChanges(response, change, channel);
                }
                else if (response.data && change._id) {
                    return this.resolveListChanges(response, change, channel);
                }
                return response;
            }));
        }));
    }
    resolveDetailChanges(response, change, channel) {
        if (change.method === 'DELETE') {
            return {
                _: { method: change.method, channel, origin: response },
                _id: response._id,
            };
        }
        change.data._ = Object.assign(Object.assign({}, change.data._), { method: change.method, channel, origin: response });
        return change.data;
    }
    resolveListChanges(response, change, channel) {
        let index = lodash_1._.findIndex(response.data, item => item._id === change._id);
        if (index > -1 && change.method === 'DELETE') {
            change.data = response.data[index];
            response.data.splice(index, 1);
        }
        else if (index > -1 &&
            (change.method === 'PUT' || change.method === 'PATCH')) {
            const temp = response.data[index];
            response.data[index] = change.data;
            change.data = temp;
        }
        else if (change.method === 'POST') {
            response.data = [...response.data, change.data];
            index = response.data.length - 1;
        }
        else {
            return;
        }
        return {
            _: Object.assign(Object.assign({}, response._), { method: change.method, channel, new: change.method === 'DELETE'
                    ? undefined
                    : this.privateDataInterceptor.omit(response.data[index]), origin: change.method === 'POST' ? undefined : change.data }),
            data: response.data,
        };
    }
};
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", Ws.Server)
], WebsocketGateway.prototype, "server", void 0);
__decorate([
    websockets_1.SubscribeMessage('subscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Ws, Object]),
    __metadata("design:returntype", Promise)
], WebsocketGateway.prototype, "onEvent", null);
WebsocketGateway = __decorate([
    websockets_1.WebSocketGateway(),
    common_1.UseInterceptors(private_interceptor_1.PrivateInterceptor),
    common_1.UseInterceptors(reference_interceptor_1.ReferenceInterceptor),
    __param(1, common_1.Inject(constants_1.NOREST_CONFIG_TOKEN)),
    __metadata("design:paramtypes", [connector_service_1.ConnectorService, Object, core_1.HttpAdapterHost,
        private_interceptor_1.PrivateInterceptor])
], WebsocketGateway);
exports.WebsocketGateway = WebsocketGateway;
//# sourceMappingURL=websocket.gateway.js.map