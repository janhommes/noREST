import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Patch, Post, Put, Query, Req, Scope, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { _ } from 'lodash';
import { AuthGuard } from '../auth/auth.guard';
import { PrivateInterceptor } from '../auth/interceptors/private.interceptor';
import { ReferenceInterceptor } from '../auth/interceptors/reference.interceptor';
import { DEFAULT_INDEX_FRAGMENT_PREFIX, DEFAULT_REFERENCE_DB_KEY, DEFAULT_REFERENCE_PREFIX, NOREST_CONFIG_TOKEN, REFLECTION_NESTJS_CONTROLLER_PATH } from '../common/constants';
import { Messages } from '../common/messages';
import { normalizeFragment, normalizeReference, normalizeSkipLimit } from '../common/normalize';
import { Connector } from '../connector/connector.interface';
import { ConnectorService } from '../connector/connector.service';
import { NoRestConfig } from '../norest-config.interface';

@UseInterceptors(PrivateInterceptor)
@UseInterceptors(ReferenceInterceptor)
@Controller({
  scope: Scope.DEFAULT,
})
export class RestController {
  private database: Connector;

  constructor(
    connector: ConnectorService,
    @Inject(NOREST_CONFIG_TOKEN) private config: NoRestConfig,
  ) {
    Reflect.defineMetadata(
      REFLECTION_NESTJS_CONTROLLER_PATH,
      config.path,
      RestController,
    );
    this.database = connector.database;
  }

  @Get()
  async list(
    @Req() request: Request,
    @Query('skip') skip: string | number = 0,
    @Query('limit')
    limit: string | number = this.config.rest.defaultPageSize,
    @Query('orderBy') orderBy?,
  ) {
    if (this.config.fixed) {
      throw new HttpException(Messages.API_FIXED, HttpStatus.FORBIDDEN);
    }
    const paging = normalizeSkipLimit(skip, limit);
    return this.getDatabase(request).list(paging.skip, paging.limit, orderBy);
  }

  @Get(`:fragmentOrId`)
  async listByFragmentOrDetailById(
    @Param('fragmentOrId') fragmentOrId,
    @Req() request,
    @Query('skip') skip = 0,
    @Query('limit') limit = this.config.rest.defaultPageSize,
    @Query('orderBy') orderBy?,
  ) {
    const fragment = normalizeFragment(fragmentOrId);
    const db = this.getDatabase(request);
    const isIndex = await db.isIndex(fragment);
    if (isIndex) {
      const paging = normalizeSkipLimit(skip, limit);
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
    fragment = normalizeFragment(fragment);
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
    @Query('limit') limit = this.config.rest.defaultPageSize,
  ) {
    const data = await this.detailByKey(fragment, key, request);
    const normalizedRef = normalizeReference(ref);
    const references = _.filter(
      data[DEFAULT_REFERENCE_DB_KEY],
      val => val.fragment === normalizedRef,
    );

    if (!references) {
      throw new HttpException(Messages.NO_REF_FOUND, HttpStatus.NOT_FOUND);
    }

    const paging = normalizeSkipLimit(skip, limit);
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
    await this.checkIfFragmentsAreValid(data, request);
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
    await this.checkIfFragmentsAreValid(data, request);
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
    await this.checkIfFragmentsAreValid(data, request);
    data = this.attachMetadata(data, undefined, request.auth.user);
    return this.getDatabase(request).update(id, data, partialData);
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
        this.config.rest.defaultPageSize,
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
    const fragments = _.filter(
      data,
      (val, k) => k.startsWith(DEFAULT_INDEX_FRAGMENT_PREFIX) && val,
    );
    if (fragments.length === 0) {
      throw new HttpException(
        Messages.NO_INDEX_SET,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private async checkIfFragmentsAreValid(data: any, request: Request) {
    if (this.config.fixed) {
      const fragments = Object.keys(data).filter(k => {
        return k.startsWith(DEFAULT_INDEX_FRAGMENT_PREFIX);
      });
      for (const fragmentKey in fragments) {
        try {
          await this.checkIfFragmentExist(fragments[fragmentKey], request);
        } catch (ex) {
          throw new HttpException(Messages.API_FIXED, HttpStatus.FORBIDDEN);
        }
      }
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
    fragment = normalizeFragment(fragment);
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
