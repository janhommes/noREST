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
const messages_1 = require("../common/messages");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let MockService = class MockService {
    constructor() {
        this.MAX_PAGE_SIZE = Infinity;
        this.data = [];
        this.watcher$ = new rxjs_1.BehaviorSubject(null);
    }
    resolveCollection() {
    }
    connect(config) {
        common_1.Logger.log(`${config.name} connection established.`);
    }
    isIndex(fragment) {
        return this.data.find(value => lodash_1._.has(value, fragment));
    }
    create(data) {
        if (!data._id) {
            data._id = this.createId();
        }
        this.data.push(data);
        this.watcher$.next({
            method: 'POST',
            data: data,
            _id: data._id,
        });
        return data;
    }
    read(id) {
        const result = this.data.find(items => items._id === id);
        return result;
    }
    async readByKey(fragment, key) {
        const fragmentData = await this.listByIndexFragment(fragment);
        return fragmentData.data.find(data => data._id === key ||
            lodash_1._.find(data, (val, k) => k.startsWith('_') && val == key));
    }
    list(skip, limit, orderBy) {
        const data = this.getPaged(this.data, skip, limit);
        return Promise.resolve({
            _: {
                total: this.data.length,
                skip,
                limit,
            },
            data: this.order(data, orderBy),
        });
    }
    listByIndexFragment(fragment, skip, limit, orderBy) {
        const data = this.data.filter(value => {
            return lodash_1._.has(value, fragment);
        });
        return Promise.resolve({
            _: {
                total: data.length,
                skip,
                limit,
            },
            data: this.order(this.getPaged(data, skip, limit), orderBy),
        });
    }
    listByRef(references, skip = 0, limit = this.MAX_PAGE_SIZE) {
        const data = this.data.filter(value => {
            return references.some(r => r.id == value._id);
        });
        return Promise.resolve({
            _: {
                total: data.length,
                skip,
                limit,
            },
            data: this.getPaged(data, skip, limit),
        });
    }
    update(id, data, partialData) {
        const toReplace = this.read(id);
        data._id = id;
        this.data[this.data.indexOf(toReplace)] = data;
        this.watcher$.next({
            method: partialData ? 'PATCH' : 'PUT',
            data,
            _id: data._id,
        });
        return data;
    }
    delete(id) {
        const toReplace = this.read(id);
        this.data.splice(this.data.indexOf(toReplace), 1);
        this.watcher$.next({
            method: 'DELETE',
            data: toReplace,
            _id: toReplace._id,
        });
        return toReplace;
    }
    listenOnChanges() {
        return this.watcher$.pipe(operators_1.skip(1));
    }
    order(data, orderBy) {
        if (orderBy) {
            try {
                const keysAndOrder = orderBy.trim().split(',');
                const orders = [];
                const keys = keysAndOrder.map(keyAndOrder => {
                    const split = keyAndOrder.trim().split(/ +/gm);
                    const key = split[0].trim();
                    orders.push(split[1] ? split[1].trim() : 'asc');
                    return key;
                });
                return lodash_1._.orderBy(data, keys, orders);
            }
            catch (ex) {
                throw new common_1.HttpException(messages_1.Messages.VALIDATION_ORDER, common_1.HttpStatus.BAD_REQUEST);
            }
        }
        return data;
    }
    getPaged(data, skip = 0, limit = this.MAX_PAGE_SIZE) {
        return data.slice(skip, skip + limit);
    }
    createId() {
        const random = String(Math.random()).substr(2, 6);
        const date = Date.now();
        return `${date}${random}`;
    }
};
MockService = __decorate([
    common_1.Injectable()
], MockService);
exports.MockService = MockService;
//# sourceMappingURL=mock.service.js.map