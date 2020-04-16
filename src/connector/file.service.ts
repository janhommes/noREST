import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { _ } from 'lodash';
import { Connector } from './connector.interface';
import { DbConfig } from './db-config.interface';
import { Request } from 'express';
import { Messages } from '../common/messages';
import { Reference } from './reference.interface';
import { List } from './list.interface';
import {
  readFile,
  writeFile,
  exists,
  watchFile,
  createWriteStream,
  createReadStream,
} from 'fs';
import { isAbsolute, resolve } from 'path';
import { promisify } from 'util';
import { Observable } from 'rxjs';

@Injectable()
export class FileService implements Connector {
  private readonly MAX_PAGE_SIZE = Infinity;
  private path;
  private cachedData = [];

  private _readFile = promisify(readFile);
  private _writeFile = promisify(writeFile);
  private watchers = [];
  private config: DbConfig;

  private getCollectionName(req?: Request) {
    if (_.isString(this.config.collection)) {
      return this.config.collection as string;
    }
    return (this.config.collection as Function)(req) as string;
  }

  async getData() {
    return this.cachedData[await this.resolveCollection()];
  }

  async saveData(data) {
    const collName = this.getCollectionName();
    const path = resolve(this.path, collName);
    await this._writeFile(path, JSON.stringify(data));
  }

  async resolveCollection(req?: Request) {
    const collName = this.getCollectionName(req);
    const path = resolve(this.path, collName);

    if (this.watchers[path]) {
      return path;
    }

    const _exsists = promisify(exists);
    let data = [];
    if (!(await _exsists(path))) {
      await this._writeFile(path, '[]');
    } else {
      try {
        const fileData = await this._readFile(path, 'utf8');
        data = JSON.parse(fileData);
      } catch (ex) {
        throw new Error(`Failed to load file: ${path}`);
      }
    }
    this.cachedData[path] = data;

    this.watchers[path] = watchFile(path, () => {
      this._readFile(path, 'utf8').then(data => {
        this.cachedData[path] = JSON.parse(data);
      });
    });

    return path;
  }

  async connect(config: DbConfig) {
    this.config = config;
    const path = this.config.path || '.';
    if (isAbsolute(path)) {
      this.path = path;
    } else {
      this.path = resolve(__dirname, path);
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
    await this.saveData(_data);
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
    const toReplace = await this.read(id);
    data._id = id;
    const _data = await this.getData();
    _data[_data.indexOf(toReplace)] = data;
    await this.saveData(_data);
    return data;
  }

  async delete(id: string) {
    const toReplace = await this.read(id);
    const _data = await this.getData();
    _data.splice(_data.indexOf(toReplace), 1);
    await this.saveData(_data);
    return toReplace;
  }

  listenOnChanges(fragment?: any, id?: any): Observable<any> {
    throw new Error("Method not implemented.");
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
