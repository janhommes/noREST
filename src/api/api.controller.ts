import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseInterceptors,
  Inject,
  Post,
  Body,
  UseGuards,
  Put,
  Scope,
  Req,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { Connector } from '../connector/connector.interface';
import { ConnectorService } from '../connector/connector.service';
import { PrivateInterceptor } from './private.interceptor';
import { ApiConfig } from './api-config.interface';
import {
  API_CONFIG_TOKEN,
  REFLECTION_NESTJS_CONTROLLER_PATH,
  DEFAULT_INDEX_FRAGMENT_PREFIX,
  DEFAULT_REFERENCE_PREFIX,
  DEFAULT_REFERENCE_DB_KEY,
  DEFAULT_PAGE_SIZE,
} from '../common/constants';
import { AuthGuard } from './auth.guard';
import { _ } from 'lodash';
import { Request } from 'express';
import { Messages } from '../common/messages';
import { ReferenceInterceptor } from './reference.interceptor';

@UseInterceptors(PrivateInterceptor)
@UseInterceptors(ReferenceInterceptor)
@Controller({
  scope: Scope.DEFAULT,
})
export class ApiController {
  private database: Connector;

  constructor(
    connector: ConnectorService,
    @Inject(API_CONFIG_TOKEN) apiConfig: ApiConfig,
  ) {
    Reflect.defineMetadata(
      REFLECTION_NESTJS_CONTROLLER_PATH,
      apiConfig.config.baseRoute,
      ApiController,
    );
    this.database = connector.database;
  }

  @Get()
  async list(
    @Req() request,
    @Query('skip') skip: string | number = 0,
    @Query('limit') limit: string | number = DEFAULT_PAGE_SIZE,
    @Query('orderBy') orderBy?,
  ) {
    const paging = this.normalizeSkipLimit(skip, limit);
    return this.getDatabase(request).list(paging.skip, paging.limit, orderBy);
  }

  @Get(`:fragmentOrId`)
  async listByFragmentOrDetailById(
    @Param('fragmentOrId') fragmentOrId,
    @Req() request,
    @Query('skip') skip = 0,
    @Query('limit') limit = DEFAULT_PAGE_SIZE,
    @Query('orderBy') orderBy?,
  ) {
    const fragment = this.normalizeFragment(fragmentOrId);
    const db = this.getDatabase(request);
    const isIndex = await db.isIndex(fragment);
    if (isIndex) {
      const paging = this.normalizeSkipLimit(skip, limit);
      return this.getDatabase(request).listByIndexFragment(
        fragment,
        paging.skip,
        paging.limit,
        orderBy,
      );
    }
    return this.checkIfExist(fragmentOrId, request);
  }

  @Get(':fragment/:key')
  async detailByKey(
    @Param('fragment') fragment,
    @Param('key') key,
    @Req() request,
  ) {
    fragment = this.normalizeFragment(fragment);
    const data = await this.getDatabase(request).readByKey(fragment, key);
    if (!data) {
      throw new HttpException(Messages.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return data;
  }

  @Get(':fragment/:key/:ref')
  async detailReferences(
    @Param('fragment') fragment,
    @Param('key') key,
    @Param('ref') ref,
    @Req() request,
    @Query('skip') skip = 0,
    @Query('limit') limit = DEFAULT_PAGE_SIZE,
  ) {
    const data = await this.detailByKey(fragment, key, request);
    const normalizedRef = this.normalizeReference(ref);
    const references = _.filter(
      data[DEFAULT_REFERENCE_DB_KEY],
      val => val.fragment === normalizedRef,
    );

    if (!references) {
      throw new HttpException(Messages.NO_REF_FOUND, HttpStatus.NOT_FOUND);
    }

    const paging = this.normalizeSkipLimit(skip, limit);
    if (!references[0].oneToOne) {
      return this.getDatabase(request).listByRef(
        references,
        paging.skip,
        paging.limit,
      );
    }

    return this.listByFragmentOrDetailById(
      references[0].id,
      request,
      paging.skip,
      paging.limit,
    );
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() data, @Req() request) {
    this.validateMetaData(data);
    this.validateIfIndexFragmentIsSet(data);
    await this.checkIfRefExist(data, request);
    data = this.attachMetadata(data, request.auth.user);
    await this.checkIfExist(data._id, request, false);
    const createdData = await this.getDatabase(request).create(data);
    return createdData;
  }

  @UseGuards(AuthGuard)
  @Post(':fragment')
  async createFragment(
    @Param('fragment') fragment,
    @Body() data,
    @Req() request,
  ) {
    fragment = await this.checkIfFragmentExist(fragment, request);
    data = this.attachFragmentIfNotSet(fragment, data);
    return this.create(data, request);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(@Param('id') id, @Body() data, @Req() request) {
    if (data._id) {
      throw new HttpException(
        Messages.VALIDATION_CONFLICT,
        HttpStatus.CONFLICT,
      );
    }
    await this.checkIfExist(id, request);
    await this.checkIfRefExist(data, request);
    this.validateMetaData(data);
    this.validateIfIndexFragmentIsSet(data);
    data = this.attachMetadata(data, request.auth.user);
    return this.getDatabase(request).update(id, data);
  }

  @UseGuards(AuthGuard)
  @Put(':fragment/:id')
  async updateFragment(
    @Param('id') id,
    @Param('fragment') fragment,
    @Body() data,
    @Req() request,
  ) {
    fragment = await this.checkIfFragmentExist(fragment, request);
    id = await this.checkIfIdIsAKey(fragment, id, request);
    data = this.attachFragmentIfNotSet(fragment, data);
    return this.update(id, data, request);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async change(@Param('id') id, @Body() partialData, @Req() request) {
    const existing = await this.checkIfExist(id, request);
    this.validateMetaData(partialData);
    this.validateDataForReadonly(partialData);
    let data = { ...existing, ...partialData };
    this.validateIfIndexFragmentIsSet(data);
    data = this.removeNullFragments(data);
    await this.checkIfRefExist(data, request);
    data = this.attachMetadata(data, undefined, request.auth.user);
    return this.getDatabase(request).update(id, data);
  }

  @UseGuards(AuthGuard)
  @Patch(':fragment/:id')
  async changeByFragment(
    @Param('id') id,
    @Param('fragment') fragment,
    @Body() partialData,
    @Req() request,
  ) {
    fragment = await this.checkIfFragmentExist(fragment, request);
    id = await this.checkIfIdIsAKey(fragment, id, request);
    return this.change(id, partialData, request);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param('id') id, @Req() request) {
    await this.checkIfExist(id, request);
    return this.getDatabase(request).delete(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':fragment/:id')
  async deleteByFragment(
    @Param('id') id,
    @Param('fragment') fragment,
    @Req() request,
  ) {
    fragment = await this.checkIfFragmentExist(fragment, request);
    id = await this.checkIfIdIsAKey(fragment, id, request);
    return this.delete(id, request);
  }

  private getDatabase(request: Request) {
    this.database.resolveCollection(request);
    return this.database;
  }

  private async checkIfRefExist(data: any, request: Request) {
    if (data[DEFAULT_REFERENCE_DB_KEY]) {
      // TODO: LIMIT
      const result = await this.getDatabase(request).listByRef(
        data[DEFAULT_REFERENCE_DB_KEY],
        0,
        DEFAULT_PAGE_SIZE,
      );

      // TODO: LENGTH COULD BE THE SAME :(
      if (data[DEFAULT_REFERENCE_DB_KEY].length !== result.data.length) {
        const notFound = _.differenceWith(
          data[DEFAULT_REFERENCE_DB_KEY],
          result.data,
          (a, b) => a.id === b._id,
        )
          .map(
            ({ id, fragment }) =>
              `${Messages.NO_REF_FOUND_CREATE} '${fragment}': '${id}'`,
          )
          .join(' ');
        throw new HttpException(notFound, HttpStatus.NOT_FOUND);
      }
    }
  }

  private removeNullFragments(data: any) {
    const allNullFragments = _.omitBy(
      data,
      (val, k) =>
        (k.startsWith(DEFAULT_INDEX_FRAGMENT_PREFIX) ||
          k.startsWith(DEFAULT_REFERENCE_PREFIX)) &&
        val === null,
    );
    return allNullFragments;
  }

  private validateMetaData(data) {
    if (data._) {
      throw new HttpException(
        Messages.VALIDATION_METADATA_IMMUTABLE,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private validateDataForReadonly(data) {
    if (_.find(data, (val, k) => k.startsWith('_'))) {
      throw new HttpException(
        Messages.VALIDATION_READABLE_IMMUTABLE,
        HttpStatus.CONFLICT,
      );
    }
  }

  private validateIfIndexFragmentIsSet(data: any) {
    if (
      !_.find(data, (val, k) => k.startsWith(DEFAULT_INDEX_FRAGMENT_PREFIX))
    ) {
      throw new HttpException(
        Messages.NO_INDEX_SET,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private async checkIfIdIsAKey(fragment: any, id: any, request: Request) {
    const keyData = await this.detailByKey(fragment, id, request);
    if (keyData) {
      id = keyData._id;
    }
    return id;
  }

  private async checkIfFragmentExist(fragment: any, request: Request) {
    fragment = this.normalizeFragment(fragment);
    const db = this.getDatabase(request);
    const isIndex = await db.isIndex(fragment);
    if (!isIndex) {
      throw new HttpException(Messages.NO_ROUTE_FOUND, HttpStatus.NOT_FOUND);
    }
    return fragment;
  }

  private async checkIfExist(id: any, request: Request, shouldExist = true) {
    const db = this.getDatabase(request);
    const existing = await db.read(id);
    if (!existing && shouldExist) {
      throw new HttpException(Messages.NOT_FOUND, HttpStatus.NOT_FOUND);
    } else if (existing && !shouldExist) {
      throw new HttpException(
        Messages.VALIDATION_CONFLICT,
        HttpStatus.CONFLICT,
      );
    }
    return existing;
  }

  private normalizeSkipLimit(skip, limit) {
    skip = parseInt(`${skip}`, 10);
    limit = parseInt(`${limit}`, 10);
    if (isNaN(skip) || isNaN(limit) || skip < 0 || limit < 0) {
      throw new HttpException(
        Messages.SKIP_QUERY_NO_POSITIVE_NUMBER,
        HttpStatus.PRECONDITION_FAILED,
      );
    }
    return { skip, limit };
  }

  private normalizeFragment(frag: string) {
    return (frag || '').startsWith(DEFAULT_INDEX_FRAGMENT_PREFIX)
      ? frag
      : `${DEFAULT_INDEX_FRAGMENT_PREFIX}${frag}`;
  }

  private normalizeReference(frag: string) {
    return frag.startsWith(DEFAULT_REFERENCE_PREFIX)
      ? frag
      : `${DEFAULT_REFERENCE_PREFIX}${frag}`;
  }

  private attachFragmentIfNotSet(fragment: any, data: any) {
    if (fragment && !_.find(data, (val, k) => k === `${fragment}`)) {
      data[fragment] = {};
    }
    return data;
  }

  private attachMetadata(data, owner?, changedBy?) {
    const d = _.clone(data);
    d._ = {
      owner: owner ? owner : data._.owner,
      created: owner ? new Date().toISOString() : data._.created,
      changedBy: changedBy ? changedBy : owner,
      changed: new Date().toISOString(),
    };
    return d;
  }
}
