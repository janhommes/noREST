import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Scope,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import {
  AuthGuard,
  ConnectorConfig,
  NOREST_CONNECTOR_CONFIG_TOKEN,
} from '@norest/nestjs';
import * as faker from 'faker';
import { exists, writeFile, readFile } from 'fs';
import { ObjectID } from 'mongodb';
import { isAbsolute, resolve } from 'path';
import { promisify } from 'util';
import { FakeDefinition } from './fake-definition.class';

@Controller({
  scope: Scope.DEFAULT,
  path: 'faker',
})
export class FakerController {
  private _exists = promisify(exists);
  private _writeFile = promisify(writeFile);
  private _readFile = promisify(readFile);

  constructor(
    @Inject(NOREST_CONNECTOR_CONFIG_TOKEN)
    protected config: ConnectorConfig,
  ) {}

  @Post('fake')
  @UseGuards(AuthGuard)
  async createFake(@Body() fakeDefinition: FakeDefinition, @Req() request) {
    const def = new FakeDefinition(fakeDefinition);
    this.verifyDef(def);
    let path = this.config.path || '.';
    if (isAbsolute(path)) {
      path = resolve(path, def.collection);
    } else {
      path = resolve(process.cwd(), path, def.collection);
    }

    if (await this._exists(path)) {
      throw new HttpException(
        `Collection ${def.collection} already exist.`,
        HttpStatus.CONFLICT,
      );
    }

    const content = this.createData(def, request);
    await this._writeFile(path, JSON.stringify(content));
  }

  @Put('fake')
  @UseGuards(AuthGuard)
  async addFake(@Body() fakeDefinition: FakeDefinition, @Req() request) {
    const def = new FakeDefinition(fakeDefinition);
    this.verifyDef(def);

    let path = this.config.path || '.';
    if (isAbsolute(path)) {
      path = resolve(path, def.collection);
    } else {
      path = resolve(process.cwd(), path, def.collection);
    }

    if (!(await this._exists(path))) {
      throw new HttpException(
        `Collection ${def.collection} does not exist.`,
        HttpStatus.NOT_FOUND,
      );
    }

    const data = JSON.parse(await this._readFile(path, 'utf8'));
    const content = this.createData(def, request);
    const combined = [...data, ...content];
    await this._writeFile(path, JSON.stringify(combined));
  }

  private verifyDef(def: FakeDefinition) {
    if (this.config.name !== 'file') {
      throw new HttpException(
        'Only file connector is supported.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    if (!def.collection || def.collection === '') {
      throw new HttpException(
        'Please provide a collection.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    if (def.amount > 1000) {
      throw new HttpException(
        `We can't fake more then 1000 entries.`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
  }

  private createData(def: FakeDefinition, request: any) {
    const content = [];
    let fragment = def.fragment || def.namespace;
    faker.local = def.local;
    for (let i = 1; i <= def.amount; i++) {
      let data = {};
      if (def.namespace === 'createCard') {
        data = faker.helpers.createCard();
        fragment = def.fragment || 'user';
      } else {
        if (faker[def.namespace]) {
          for (const key in faker[def.namespace]) {
            data[key] = faker[def.namespace][key]();
          }
        } else {
          throw new HttpException(
            `Unknown faker namespace.`,
            HttpStatus.NOT_ACCEPTABLE,
          );
        }
      }

      data = {
        _: {
          owner: request.auth.user,
          created: new Date().toISOString(),
          changedBy: request.auth.user,
          changed: new Date().toISOString(),
        },
        _id: new ObjectID().toHexString(),
        [`#_${fragment}`]: {},
        ...data,
      };
      content.push(data);
    }
    return content;
  }
}
