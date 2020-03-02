import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { _ } from 'lodash';
import { Connector } from './connector.interface';
import { DbConfig } from './db-config.interface';
import { Request } from 'express';
import { Messages } from '../common/messages';
import { Reference } from './reference.interface';
import { List } from './list.interface';
import { readFile, writeFile, exists, mkdir } from 'fs';
import { isAbsolute, resolve } from 'path';
import { promisify } from 'util';

@Injectable()
export class FileService implements Connector {
  private readonly MAX_PAGE_SIZE = Infinity;
  private path;
  private cachedData = [];

  private config: DbConfig;

  private getCollectionName(req?: Request) {
    if (_.isString(this.config.collection)) {
      return this.config.collection as string;
    }
    return (this.config.collection as Function)(req) as string;
  }

  async getData() {
    if (_.isString(this.config.collection)) {
      return this.cachedData;
    } else {
      return await this.resolveCollection();
    }
  }

  async saveData(data) {
    const collName = this.getCollectionName();
    const path = resolve(this.path, collName);
    const _writeFile = promisify(writeFile);
    _writeFile(path, JSON.stringify(data));
  }

  async resolveCollection(req?: Request) {
    const collName = this.getCollectionName(req);
    const path = resolve(this.path, collName);
    const _exsists = promisify(exists);
    let data = [];
    if (!(await _exsists(path))) {
      const _writeFile = promisify(writeFile);
      await _writeFile(path, '[]');
    } else {
      const _readFile = promisify(readFile);
      data = JSON.parse(await _readFile(path, 'utf8'));
    }
    this.cachedData = data;
    return data;
  }

  async connect(config: DbConfig) {
    this.config = config;
    if (isAbsolute(this.config.path)) {
      this.path = this.config.path;
    } else {
      this.path = resolve(__dirname, this.config.path);
    }
    await this.resolveCollection();
    Logger.log(`${config.name} connection established.`);
  }

  async isIndex(fragment: any) {
    return (await this.getData()).find(value => _.has(value, fragment));
  }

  async create(data: any) {
    if (!data._id) {
      data._id = this.createId();
    }
    const _data = await this.getData();
    _data.push(data);
    this.saveData(_data);
    return data;
  }

  async read(id: string) {
    const result = (await this.getData()).find(items => items._id === id);
    return result;
  }

  async readByKey(fragment: string, key: string) {
    const fragmentData = await this.listByIndexFragment(fragment);
    return fragmentData.data.find(
      data =>
        data._id === key ||
        _.find(data, (val, k) => k.startsWith('_') && val == key),
    );
  }

  async list(skip: number, limit: number, orderBy?: string) {
    const data = this.getPaged(await this.getData(), skip, limit);
    return Promise.resolve({
      _: {
        total: data.length,
        skip,
        limit,
      },
      data: this.order(data, orderBy),
    });
  }

  async listByIndexFragment(
    fragment: string,
    skip?: number,
    limit?: number,
    orderBy?: string,
  ) {
    const data = (await this.getData()).filter(value => {
      return _.has(value, fragment);
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

  async listByRef(
    references: Reference[],
    skip: number = 0,
    limit: number = this.MAX_PAGE_SIZE,
  ): Promise<List> {
    const data = (await this.getData()).filter(value => {
      // tslint:disable-next-line: triple-equals
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

  async update(id: string, data: any) {
    const toReplace = this.read(id);
    data._id = id;
    const _data = await this.getData();
    _data[_data.indexOf(toReplace)] = data;
    this.saveData(_data);
    return data;
  }

  async delete(id: string) {
    const toReplace = this.read(id);
    const _data = await this.getData();
    _data.splice(_data.indexOf(toReplace), 1);
    this.saveData(_data);
    return toReplace;
  }

  private order(data, orderBy?: string) {
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
        return _.orderBy(data, keys, orders);
      } catch (ex) {
        throw new HttpException(
          Messages.VALIDATION_ORDER,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return data;
  }

  private getPaged(data, skip = 0, limit = this.MAX_PAGE_SIZE) {
    return data.slice(skip, skip + limit);
  }

  private createId() {
    const random = String(Math.random()).substr(2, 6);
    const date = Date.now();
    return `${date}${random}`;
  }
}
