"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const operators_1 = require("rxjs/operators");
const WebSocket = require("ws");
const constants_1 = require("../../common/constants");
let ReferenceInterceptor = class ReferenceInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        if (!(request instanceof WebSocket) &&
            ['POST', 'PUT', 'PATCH'].includes(request.method)) {
            request.body = this.unmapValues(request.body);
        }
        return next.handle().pipe(operators_1.map(values => {
            const _values = lodash_1._.clone(values);
            if (!_values.data) {
                return this.mapValues(_values);
            }
            _values.data.map(value => this.mapValues(value));
            return _values;
        }));
    }
    unmapValues(value) {
        Object.keys(value).forEach(key => {
            if (key.startsWith(constants_1.DEFAULT_REFERENCE_PREFIX)) {
                if (!value[constants_1.DEFAULT_REFERENCE_DB_KEY]) {
                    value[constants_1.DEFAULT_REFERENCE_DB_KEY] = [];
                }
                if (Array.isArray(value[key])) {
                    value[constants_1.DEFAULT_REFERENCE_DB_KEY] = [
                        ...value[constants_1.DEFAULT_REFERENCE_DB_KEY],
                        ...value[key].map(id => ({ id, fragment: key })),
                    ];
                }
                else {
                    value[constants_1.DEFAULT_REFERENCE_DB_KEY].push({
                        id: value[key],
                        fragment: key,
                        oneToOne: true,
                    });
                }
            }
        });
        return lodash_1._.omitBy(value, (val, k) => k.startsWith(constants_1.DEFAULT_REFERENCE_PREFIX));
    }
    mapValues(value) {
        const references = lodash_1._.get(value, constants_1.DEFAULT_REFERENCE_DB_KEY);
        if (references) {
            references.forEach(({ id, fragment, oneToOne }) => {
                const key = fragment;
                if (oneToOne) {
                    value[key] = id;
                }
                else {
                    value[key] = [...(value[key] ? value[key] : []), id];
                }
            });
        }
        return lodash_1._.omit(value, [constants_1.DEFAULT_REFERENCE_DB_KEY]);
    }
};
ReferenceInterceptor = __decorate([
    common_1.Injectable()
], ReferenceInterceptor);
exports.ReferenceInterceptor = ReferenceInterceptor;
//# sourceMappingURL=reference.interceptor.js.map