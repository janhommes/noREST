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
var RestController_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const auth_guard_1 = require("../auth/auth.guard");
const private_interceptor_1 = require("../auth/interceptors/private.interceptor");
const reference_interceptor_1 = require("../auth/interceptors/reference.interceptor");
const constants_1 = require("../common/constants");
const messages_1 = require("../common/messages");
const normalize_1 = require("../common/normalize");
const connector_service_1 = require("../connector/connector.service");
let RestController = RestController_1 = class RestController {
    constructor(connector, config) {
        this.config = config;
        Reflect.defineMetadata(constants_1.REFLECTION_NESTJS_CONTROLLER_PATH, config.path, RestController_1);
        this.connectorFactory = connector.connectorFactory;
    }
    async list(request, skip = 0, limit = this.config.rest.defaultPageSize, orderBy) {
        if (this.config.fixed) {
            throw new common_1.HttpException(messages_1.Messages.API_FIXED, common_1.HttpStatus.FORBIDDEN);
        }
        const paging = normalize_1.normalizeSkipLimit(skip, limit);
        const db = await this.getDatabase(request);
        return db.list(paging.skip, paging.limit, orderBy);
    }
    async listByFragmentOrDetailById(fragmentOrId, request, skip = 0, limit = this.config.rest.defaultPageSize, orderBy) {
        const fragment = normalize_1.normalizeFragment(fragmentOrId);
        const db = await this.getDatabase(request);
        const isIndex = await db.isIndex(fragment);
        if (isIndex) {
            const paging = normalize_1.normalizeSkipLimit(skip, limit);
            return db.listByIndexFragment(fragment, paging.skip, paging.limit, orderBy);
        }
        return this.checkIfExist(fragmentOrId, request);
    }
    async detailByKey(fragment, key, request) {
        fragment = normalize_1.normalizeFragment(fragment);
        const db = await this.getDatabase(request);
        const data = await db.readByKey(fragment, key);
        if (!data) {
            throw new common_1.HttpException(messages_1.Messages.NOT_FOUND, common_1.HttpStatus.NOT_FOUND);
        }
        return data;
    }
    async detailReferences(fragment, key, ref, request, skip = 0, limit = this.config.rest.defaultPageSize, orderBy) {
        const data = await this.detailByKey(fragment, key, request);
        const normalizedRef = normalize_1.normalizeReference(ref);
        const references = lodash_1._.filter(data[constants_1.DEFAULT_REFERENCE_DB_KEY], val => val.fragment === normalizedRef);
        if (!references.length) {
            throw new common_1.HttpException(messages_1.Messages.NO_REF_FOUND, common_1.HttpStatus.NOT_FOUND);
        }
        const paging = normalize_1.normalizeSkipLimit(skip, limit);
        if (!references[0].oneToOne) {
            const db = await this.getDatabase(request);
            return db.listByRef(references, paging.skip, paging.limit, orderBy);
        }
        return this.listByFragmentOrDetailById(references[0].id, request, paging.skip, paging.limit);
    }
    async create(data, request) {
        this.validateMetaData(data);
        this.validateIfIndexFragmentIsSet(data);
        await this.checkIfRefExist(data, request);
        data = this.attachMetadata(data, request.auth.user);
        await this.checkIfExist(data._id, request, false);
        const db = await this.getDatabase(request);
        const createdData = db.create(data);
        return createdData;
    }
    async createFragment(fragment, data, request) {
        fragment = await this.checkIfFragmentExist(fragment, request);
        data = this.attachFragmentIfNotSet(fragment, data);
        await this.checkIfFragmentsAreValid(data, request);
        return this.create(data, request);
    }
    async update(id, data, request) {
        if (data._id) {
            throw new common_1.HttpException(messages_1.Messages.VALIDATION_CONFLICT, common_1.HttpStatus.CONFLICT);
        }
        await this.checkIfExist(id, request);
        await this.checkIfRefExist(data, request);
        await this.checkIfFragmentsAreValid(data, request);
        this.validateMetaData(data);
        this.validateIfIndexFragmentIsSet(data);
        data = this.attachMetadata(data, request.auth.user);
        const db = await this.getDatabase(request);
        return db.update(id, data);
    }
    async updateFragment(id, fragment, data, request) {
        fragment = await this.checkIfFragmentExist(fragment, request);
        id = await this.checkIfIdIsAKey(fragment, id, request);
        data = this.attachFragmentIfNotSet(fragment, data);
        return this.update(id, data, request);
    }
    async change(id, partialData, request) {
        const existing = await this.checkIfExist(id, request);
        this.validateMetaData(partialData);
        this.validateDataForReadonly(partialData);
        let data = Object.assign(Object.assign({}, existing), partialData);
        this.validateIfIndexFragmentIsSet(data);
        data = this.removeNullFragments(data);
        await this.checkIfRefExist(data, request);
        await this.checkIfFragmentsAreValid(data, request);
        data = this.attachMetadata(data, undefined, request.auth.user);
        const db = await this.getDatabase(request);
        return db.update(id, data, partialData);
    }
    async changeByFragment(id, fragment, partialData, request) {
        fragment = await this.checkIfFragmentExist(fragment, request);
        id = await this.checkIfIdIsAKey(fragment, id, request);
        return this.change(id, partialData, request);
    }
    async delete(id, request) {
        const db = await this.getDatabase(request);
        await this.checkIfExist(id, request);
        return db.delete(id);
    }
    async deleteByFragment(id, fragment, request) {
        fragment = await this.checkIfFragmentExist(fragment, request);
        id = await this.checkIfIdIsAKey(fragment, id, request);
        return this.delete(id, request);
    }
    async getDatabase(request) {
        const connector = await this.connectorFactory.resolveConnector(request, this.config.connector);
        return connector;
    }
    async checkIfRefExist(data, request) {
        if (data[constants_1.DEFAULT_REFERENCE_DB_KEY]) {
            const db = await this.getDatabase(request);
            const result = await db.listByRef(data[constants_1.DEFAULT_REFERENCE_DB_KEY], 0, this.config.rest.defaultPageSize);
            if (data[constants_1.DEFAULT_REFERENCE_DB_KEY].length !== result.data.length) {
                const notFound = lodash_1._.differenceWith(data[constants_1.DEFAULT_REFERENCE_DB_KEY], result.data, (a, b) => a.id === b._id)
                    .map(({ id, fragment }) => `${messages_1.Messages.NO_REF_FOUND_CREATE} '${fragment}': '${id}'`)
                    .join(' ');
                throw new common_1.HttpException(notFound, common_1.HttpStatus.NOT_FOUND);
            }
        }
    }
    removeNullFragments(data) {
        const allNullFragments = lodash_1._.omitBy(data, (val, k) => (k.startsWith(constants_1.DEFAULT_INDEX_FRAGMENT_PREFIX) ||
            k.startsWith(constants_1.DEFAULT_REFERENCE_PREFIX)) &&
            val === null);
        return allNullFragments;
    }
    validateMetaData(data) {
        if (data._) {
            throw new common_1.HttpException(messages_1.Messages.VALIDATION_METADATA_IMMUTABLE, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
    validateDataForReadonly(data) {
        if (lodash_1._.find(data, (val, k) => k.startsWith('_'))) {
            throw new common_1.HttpException(messages_1.Messages.VALIDATION_READABLE_IMMUTABLE, common_1.HttpStatus.CONFLICT);
        }
    }
    validateIfIndexFragmentIsSet(data) {
        const fragments = lodash_1._.filter(data, (val, k) => k.startsWith(constants_1.DEFAULT_INDEX_FRAGMENT_PREFIX) && val);
        if (fragments.length === 0) {
            throw new common_1.HttpException(messages_1.Messages.NO_INDEX_SET, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
    async checkIfFragmentsAreValid(data, request) {
        if (this.config.fixed) {
            const fragments = Object.keys(data).filter(k => {
                return k.startsWith(constants_1.DEFAULT_INDEX_FRAGMENT_PREFIX);
            });
            for (const fragmentKey in fragments) {
                try {
                    await this.checkIfFragmentExist(fragments[fragmentKey], request);
                }
                catch (ex) {
                    throw new common_1.HttpException(messages_1.Messages.API_FIXED, common_1.HttpStatus.FORBIDDEN);
                }
            }
        }
    }
    async checkIfIdIsAKey(fragment, id, request) {
        const keyData = await this.detailByKey(fragment, id, request);
        if (keyData) {
            id = keyData._id;
        }
        return id;
    }
    async checkIfFragmentExist(fragment, request) {
        fragment = normalize_1.normalizeFragment(fragment);
        const db = await this.getDatabase(request);
        const isIndex = await db.isIndex(fragment);
        if (!isIndex) {
            throw new common_1.HttpException(messages_1.Messages.NO_ROUTE_FOUND, common_1.HttpStatus.NOT_FOUND);
        }
        return fragment;
    }
    async checkIfExist(id, request, shouldExist = true) {
        const db = await this.getDatabase(request);
        const existing = await db.read(id);
        if (!existing && shouldExist) {
            throw new common_1.HttpException(messages_1.Messages.NOT_FOUND, common_1.HttpStatus.NOT_FOUND);
        }
        else if (existing && !shouldExist) {
            throw new common_1.HttpException(messages_1.Messages.VALIDATION_CONFLICT, common_1.HttpStatus.CONFLICT);
        }
        return existing;
    }
    attachFragmentIfNotSet(fragment, data) {
        if (fragment && !lodash_1._.find(data, (val, k) => k === `${fragment}`)) {
            data[fragment] = {};
        }
        return data;
    }
    attachMetadata(data, owner, changedBy) {
        const d = lodash_1._.clone(data);
        d._ = {
            owner: owner ? owner : data._.owner,
            created: owner ? new Date().toISOString() : data._.created,
            changedBy: changedBy ? changedBy : owner,
            changed: new Date().toISOString(),
        };
        return d;
    }
};
__decorate([
    common_1.Get(),
    __param(0, common_1.Req()),
    __param(1, common_1.Query('skip')),
    __param(2, common_1.Query('limit')),
    __param(3, common_1.Query('orderBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "list", null);
__decorate([
    common_1.Get(`:fragmentOrId`),
    __param(0, common_1.Param('fragmentOrId')),
    __param(1, common_1.Req()),
    __param(2, common_1.Query('skip')),
    __param(3, common_1.Query('limit')),
    __param(4, common_1.Query('orderBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "listByFragmentOrDetailById", null);
__decorate([
    common_1.Get(':fragment/:key'),
    __param(0, common_1.Param('fragment')),
    __param(1, common_1.Param('key')),
    __param(2, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "detailByKey", null);
__decorate([
    common_1.Get(':fragment/:key/:ref'),
    __param(0, common_1.Param('fragment')),
    __param(1, common_1.Param('key')),
    __param(2, common_1.Param('ref')),
    __param(3, common_1.Req()),
    __param(4, common_1.Query('skip')),
    __param(5, common_1.Query('limit')),
    __param(6, common_1.Query('orderBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "detailReferences", null);
__decorate([
    common_1.UseGuards(auth_guard_1.AuthGuard),
    common_1.Post(),
    __param(0, common_1.Body()), __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "create", null);
__decorate([
    common_1.UseGuards(auth_guard_1.AuthGuard),
    common_1.Post(':fragment'),
    __param(0, common_1.Param('fragment')),
    __param(1, common_1.Body()),
    __param(2, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "createFragment", null);
__decorate([
    common_1.UseGuards(auth_guard_1.AuthGuard),
    common_1.Put(':id'),
    __param(0, common_1.Param('id')), __param(1, common_1.Body()), __param(2, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "update", null);
__decorate([
    common_1.UseGuards(auth_guard_1.AuthGuard),
    common_1.Put(':fragment/:id'),
    __param(0, common_1.Param('id')),
    __param(1, common_1.Param('fragment')),
    __param(2, common_1.Body()),
    __param(3, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "updateFragment", null);
__decorate([
    common_1.UseGuards(auth_guard_1.AuthGuard),
    common_1.Patch(':id'),
    __param(0, common_1.Param('id')), __param(1, common_1.Body()), __param(2, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "change", null);
__decorate([
    common_1.UseGuards(auth_guard_1.AuthGuard),
    common_1.Patch(':fragment/:id'),
    __param(0, common_1.Param('id')),
    __param(1, common_1.Param('fragment')),
    __param(2, common_1.Body()),
    __param(3, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "changeByFragment", null);
__decorate([
    common_1.UseGuards(auth_guard_1.AuthGuard),
    common_1.Delete(':id'),
    __param(0, common_1.Param('id')), __param(1, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "delete", null);
__decorate([
    common_1.UseGuards(auth_guard_1.AuthGuard),
    common_1.Delete(':fragment/:id'),
    __param(0, common_1.Param('id')),
    __param(1, common_1.Param('fragment')),
    __param(2, common_1.Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], RestController.prototype, "deleteByFragment", null);
RestController = RestController_1 = __decorate([
    common_1.UseInterceptors(private_interceptor_1.PrivateInterceptor),
    common_1.UseInterceptors(reference_interceptor_1.ReferenceInterceptor),
    common_1.Controller({
        scope: common_1.Scope.DEFAULT,
    }),
    __param(1, common_1.Inject(constants_1.NOREST_CONFIG_TOKEN)),
    __metadata("design:paramtypes", [connector_service_1.ConnectorService, Object])
], RestController);
exports.RestController = RestController;
//# sourceMappingURL=rest.controller.js.map