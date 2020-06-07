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
const mongodb_1 = require("mongodb");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const constants_1 = require("../common/constants");
const messages_1 = require("../common/messages");
let MongoDbService = class MongoDbService {
    constructor() {
        this.indexFragments = [];
    }
    async init(client, collectionName, config) {
        try {
            this.collection = client.db().collection(collectionName);
            this.indexFragments = await this.getIndexFragments();
        }
        catch (ex) {
            if (config.createCollectionNotExisting && ex.code === 26) {
                this.collection = await client.db().createCollection(collectionName);
                this.indexFragments = await this.getIndexFragments();
            }
            else {
                throw ex;
            }
        }
        this.watcher$ = rxjs_1.fromEvent(this.collection.watch(), 'change');
    }
    listenOnChanges() {
        return this.watcher$.pipe(operators_1.map((change) => ({
            _id: change.documentKey._id.toHexString(),
            method: this.mapOperationType(change.operationType),
            data: change.fullDocument
                ? Object.assign(Object.assign({}, change.fullDocument), { _id: change.documentKey._id.toHexString() }) : undefined,
        })));
    }
    mapOperationType(operationType) {
        switch (operationType) {
            case 'insert': {
                return 'POST';
            }
            case 'update': {
                return 'PATCH';
            }
            case 'replace': {
                return 'PUT';
            }
            case 'delete': {
                return 'DELETE';
            }
        }
        return 'GET';
    }
    async isIndex(fragment) {
        if (!this.indexFragments) {
            this.indexFragments = await this.getIndexFragments();
        }
        return this.indexFragments.indexOf(fragment) > -1;
    }
    async create(data) {
        const newData = Object.assign({ _id: new mongodb_1.ObjectId() }, data);
        await this.collection.insertOne(newData);
        await this.setIndexFragments(newData);
        return newData;
    }
    async read(id) {
        const result = await this.collection.findOne({
            _id: this.getObjectIdIfValid(id),
        });
        return result;
    }
    async readByKey(fragment, key) {
        const result = await this.read(key);
        if (!result) {
            const results = await this.listByIndexFragment(fragment, 0, 0);
            return results.data.find(data => lodash_1._.find(data, (val, k) => k.startsWith('_') && val == key));
        }
        if (!lodash_1._.has(result, fragment)) {
            return;
        }
        return result;
    }
    async list(skip, limit, orderBy) {
        const sortFilter = this.createSearchFilter(orderBy);
        const result = this.collection
            .find()
            .skip(skip)
            .limit(limit)
            .sort(sortFilter);
        return {
            _: {
                total: await result.count(),
                skip,
                limit,
            },
            data: await result.toArray(),
        };
    }
    async listByIndexFragment(fragment, skip, limit, orderBy) {
        const sortFilter = this.createSearchFilter(orderBy);
        const result = this.collection
            .find({ [fragment]: { $exists: true } })
            .skip(skip)
            .limit(limit)
            .sort(sortFilter);
        return {
            _: {
                total: await result.count(),
                skip,
                limit,
            },
            data: await result.toArray(),
        };
    }
    async listByRef(references, skip, limit, orderBy) {
        const sortFilter = this.createSearchFilter(orderBy);
        const refIds = lodash_1._.map(references, ref => this.getObjectIdIfValid(ref.id));
        const result = this.collection
            .find({ _id: { $in: refIds } })
            .skip(skip)
            .limit(limit)
            .sort(sortFilter);
        return {
            _: {
                total: await result.count(),
                skip,
                limit,
            },
            data: await result.toArray(),
        };
    }
    async update(id, data, partialData) {
        if (partialData) {
            await this.collection.findOneAndUpdate({ _id: this.getObjectIdIfValid(id) }, { $set: Object.assign({}, partialData) }, { upsert: true });
        }
        else {
            await this.collection.findOneAndReplace({ _id: this.getObjectIdIfValid(id) }, data);
        }
        this.setIndexFragments(data);
        return Object.assign({ _id: id }, data);
    }
    async delete(id) {
        const result = await this.collection.findOneAndDelete({
            _id: this.getObjectIdIfValid(id),
        });
        const references = await this.collection
            .find({
            [`${constants_1.DEFAULT_REFERENCE_DB_KEY}.${constants_1.DEFAULT_REFERENCE_DB_IDENTIFIER_KEY}`]: `${id}`,
        })
            .toArray();
        await references.forEach(async (data) => {
            data[constants_1.DEFAULT_REFERENCE_DB_KEY] = data[constants_1.DEFAULT_REFERENCE_DB_KEY].filter(ref => ref === `${id}`);
            if (data[constants_1.DEFAULT_REFERENCE_DB_KEY].length === 0) {
                delete data[constants_1.DEFAULT_REFERENCE_DB_KEY];
            }
            await this.update(`${data._id}`, data);
        });
        return result.value;
    }
    async getIndexFragments() {
        return lodash_1._.filter(await this.collection.indexes(), val => val.name.startsWith(constants_1.DEFAULT_INDEX_FRAGMENT_PREFIX)).map(({ key }) => Object.keys(key)[0]);
    }
    async setIndexFragments(data) {
        const newIndexes = lodash_1._.map(data, (val, key) => key.startsWith(constants_1.DEFAULT_INDEX_FRAGMENT_PREFIX) &&
            !this.indexFragments.find(k => k === key) && { key: { [key]: 1 } }).filter(Boolean);
        if (newIndexes.length > 0) {
            await this.collection.createIndexes(newIndexes);
            this.indexFragments = await this.getIndexFragments();
        }
    }
    getObjectIdIfValid(id) {
        return mongodb_1.ObjectId.isValid(id) ? new mongodb_1.ObjectId(id) : id;
    }
    createSearchFilter(orderBy) {
        if (orderBy) {
            try {
                const keysAndOrder = orderBy
                    .replace(/desc/i, '-1')
                    .replace(/asc/i, '1')
                    .trim()
                    .split(',');
                const sort = {};
                keysAndOrder.forEach(keyAndOrder => {
                    const split = keyAndOrder.trim().split(/ +/gm);
                    const key = split[0].trim();
                    const order = parseInt(split[1].trim(), 10);
                    sort[key] = isNaN(order) ? 1 : order;
                });
                return sort;
            }
            catch (ex) {
                throw new common_1.HttpException(messages_1.Messages.VALIDATION_ORDER, common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
};
MongoDbService = __decorate([
    common_1.Injectable()
], MongoDbService);
exports.MongoDbService = MongoDbService;
//# sourceMappingURL=mongodb.service.js.map