"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const deep_object_diff_1 = require("deep-object-diff");
const fs_1 = require("fs");
const lodash_1 = require("lodash");
const mongodb_1 = require("mongodb");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const util_1 = require("util");
const messages_1 = require("../common/messages");
let FileService = class FileService {
    constructor() {
        this.MAX_PAGE_SIZE = Infinity;
        this.FILE_WATCH_INTERVAL = 500;
        this.cachedData = [];
        this._readFile = util_1.promisify(fs_1.readFile);
        this._writeFile = util_1.promisify(fs_1.writeFile);
        this.watchers = [];
        this.watcher$ = new rxjs_1.BehaviorSubject(null);
    }
    getCollectionName(req) {
        if (lodash_1._.isString(this.config.collection)) {
            return this.config.collection;
        }
        return this.config.collection(req);
    }
    async getData() {
        const path = await this.resolveCollection();
        return this.cachedData[path];
    }
    async saveData(data) {
        const collName = this.getCollectionName();
        const path = path_1.resolve(this.path, collName);
        await this._writeFile(path, JSON.stringify(data));
    }
    async resolveCollection(req) {
        const collName = this.getCollectionName(req);
        const path = path_1.resolve(this.path, collName);
        if (this.watchers[path]) {
            return path;
        }
        const _exsists = util_1.promisify(fs_1.exists);
        let data = [];
        if (!(await _exsists(path))) {
            await this._writeFile(path, '[]');
        }
        else {
            try {
                const fileData = await this._readFile(path, 'utf8');
                data = JSON.parse(fileData);
            }
            catch (ex) {
                throw new Error(`Failed to load file: ${path}`);
            }
        }
        this.cachedData[path] = data;
        this.watchers[path] = fs_1.watchFile(path, { interval: this.FILE_WATCH_INTERVAL }, () => {
            this._readFile(path, 'utf8').then(d => {
                const json = JSON.parse(d);
                const changes = deep_object_diff_1.detailedDiff(this.cachedData[path], json);
                this.watcher$.next({
                    changes,
                    data: json,
                    origin: this.cachedData[path],
                });
                this.cachedData[path] = json;
            });
        });
        return path;
    }
    async connect(config) {
        this.config = config;
        const path = this.config.path || '.';
        if (path_1.isAbsolute(path)) {
            this.path = path;
        }
        else {
            this.path = path_1.resolve(__dirname, path);
        }
        await this.resolveCollection();
        common_1.Logger.log(`${config.name} connection established.`);
    }
    mapOperationType(addedIndexes, deletedIndexes, updatedIndexes, index) {
        if (addedIndexes.indexOf(index) > -1) {
            return 'POST';
        }
        else if (deletedIndexes.indexOf(index) > -1 &&
            updatedIndexes.indexOf(index) > -1) {
            return 'PUT';
        }
        else if (updatedIndexes.indexOf(index) > -1) {
            return 'PATCH';
        }
        else if (deletedIndexes.indexOf(index) > -1) {
            return 'DELETE';
        }
        return 'GET';
    }
    async isIndex(fragment) {
        return (await this.getData()).find(value => lodash_1._.has(value, fragment));
    }
    async create(data) {
        if (!data._id) {
            data._id = this.createId();
        }
        const allData = await this.getData();
        allData.push(data);
        await this.saveData(allData);
        this.watcher$.next({
            method: 'POST',
            data: data,
            _id: data._id,
        });
        return data;
    }
    async read(id) {
        const result = (await this.getData()).find(items => items._id === id);
        return result;
    }
    async readByKey(fragment, key) {
        const fragmentData = await this.listByIndexFragment(fragment);
        return fragmentData.data.find(data => data._id === key ||
            lodash_1._.find(data, (val, k) => k.startsWith('_') && val == key));
    }
    async list(skip, limit, orderBy) {
        const data = await this.getData();
        return Promise.resolve({
            _: {
                total: data.length,
                skip,
                limit,
            },
            data: this.order(this.getPaged(data, skip, limit), orderBy),
        });
    }
    async listByIndexFragment(fragment, skip, limit, orderBy) {
        const data = (await this.getData()).filter(value => {
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
    async listByRef(references, skip = 0, limit = this.MAX_PAGE_SIZE) {
        const data = (await this.getData()).filter(value => {
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
    async update(id, data, partialData) {
        const allData = await this.getData();
        const toReplace = allData.find(items => items._id === id);
        data._id = id;
        allData[allData.indexOf(toReplace)] = data;
        await this.saveData(allData);
        this.watcher$.next({
            method: partialData ? 'PATCH' : 'PUT',
            data: data,
            _id: data._id,
        });
        return data;
    }
    async delete(id) {
        const toReplace = await this.read(id);
        const allData = await this.getData();
        allData.splice(allData.indexOf(toReplace), 1);
        await this.saveData(allData);
        this.watcher$.next({
            method: 'DELETE',
            data: toReplace,
            _id: toReplace._id,
        });
        return toReplace;
    }
    listenOnChanges() {
        return this.watcher$.pipe(operators_1.filter(diff => diff), operators_1.mergeMap(({ changes, data, origin }) => rxjs_1.from(this.mapDiffToChangeset(changes, origin, data))));
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
        return new mongodb_1.ObjectID().toHexString();
    }
    mapDiffToChangeset(changes, origin, data) {
        const changeset = [];
        const addedIndexes = Object.keys(changes.added) || [];
        const deletedIndexes = Object.keys(changes.deleted) || [];
        const updatedIndexes = Object.keys(changes.updated) || [];
        lodash_1._.uniq([...addedIndexes, ...deletedIndexes, ...updatedIndexes]).forEach(index => {
            const method = this.mapOperationType(addedIndexes, deletedIndexes, updatedIndexes, index);
            const isDelete = method === 'DELETE';
            changeset.push({
                method,
                _id: isDelete
                    ? origin[parseInt(index)]._id
                    : data[parseInt(index)]._id,
                data: isDelete ? origin[parseInt(index)] : data[parseInt(index)],
            });
        });
        return changeset;
    }
};
FileService = __decorate([
    common_1.Injectable()
], FileService);
exports.FileService = FileService;
//# sourceMappingURL=file.service.js.map