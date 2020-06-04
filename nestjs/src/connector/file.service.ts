import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { detailedDiff } from 'deep-object-diff';
import { Request } from 'express';
import { exists, readFile, watchFile, writeFile } from 'fs';
import { _ } from 'lodash';
import { ObjectID } from 'mongodb';
import { isAbsolute, resolve } from 'path';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { promisify } from 'util';
import { Messages } from '../common/messages';
import { Changeset } from '../websocket/changeset.interface';
import { ConnectorConfig } from './connector-config.interface';
import { Connector } from './connector.interface';
import { List } from './list.interface';
import { Reference } from './reference.interface';
import { DEFAULT_REFERENCE_DB_KEY } from '../common/constants';

@Injectable()
export class FileService implements Connector {
  private readonly MAX_PAGE_SIZE = Infinity;
  private readonly FILE_WATCH_INTERVAL = 500;
  private path;
  private cachedData = [];
  private _readFile = promisify(readFile);
  private _writeFile = promisify(writeFile);
  private watchers = [];
  private config: ConnectorConfig;
  private watcher$ = new BehaviorSubject(null);

  private async getCollectionName(req?: Request) {
    if (_.isString(this.config.collection)) {
      return this.config.collection as string;
    }
    return (await (this.config.collection as Function)(req)) as string;
  }

  async getData() {
    const path = await this.resolveCollection();
    return this.cachedData[path];
  }

  async saveData(data) {
    // TODO: req is not passed to this function
    const collName = await this.getCollectionName();
    const path = resolve(this.path, collName);
    await this._writeFile(path, JSON.stringify(data));
  }

  async resolveCollection(req?: Request) {
    const collName = await this.getCollectionName(req);
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

    this.watchers[path] = watchFile(
      path,
      { interval: this.FILE_WATCH_INTERVAL },
      () => {
        this._readFile(path, 'utf8').then(d => {
          const json = JSON.parse(d);
          const changes = detailedDiff(this.cachedData[path], json);
          this.watcher$.next({
            changes,
            data: json,
            origin: this.cachedData[path],
          });
          this.cachedData[path] = json;
        });
      },
    );

    return path;
  }

  async connect(config: ConnectorConfig) {
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

  private mapOperationType(
    addedIndexes: string[],
    deletedIndexes: string[],
    updatedIndexes: string[],
    index,
  ): 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT' {
    if (addedIndexes.indexOf(index) > -1) {
      return 'POST';
    } else if (
      deletedIndexes.indexOf(index) > -1 &&
      updatedIndexes.indexOf(index) > -1
    ) {
      return 'PUT';
    } else if (updatedIndexes.indexOf(index) > -1) {
      return 'PATCH';
    } else if (deletedIndexes.indexOf(index) > -1) {
      return 'DELETE';
    }
    return 'GET';
  }

  async isIndex(fragment: any) {
    return (await this.getData()).find(value => _.has(value, fragment));
  }

  async create(data: any) {
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
      data: this.getPaged(this.order(data, orderBy), skip, limit),
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
      data: this.getPaged(this.order(data, orderBy), skip, limit),
    });
  }

  async listByRef(
    references: Reference[],
    skip = 0,
    limit: number = this.MAX_PAGE_SIZE,
    orderBy?: string,
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
      data: this.getPaged(this.order(data, orderBy), skip, limit),
    });
  }

  async update(id: string, data: any, partialData) {
    const allData = await this.getData();
    const toReplaceIndex = allData.findIndex(items => items._id === id);
    data._id = id;
    allData[toReplaceIndex] = data;
    await this.saveData(allData);
    this.watcher$.next({
      method: partialData ? 'PATCH' : 'PUT',
      data: data,
      _id: data._id,
    });
    return data;
  }

  async delete(id: string) {
    const toReplace = await this.read(id);
    const allData = await this.getData();
    allData.splice(allData.indexOf(toReplace), 1);

    allData.forEach(data => {
      const d = data[DEFAULT_REFERENCE_DB_KEY];
      if (d && d.length && _.find(d, value => value.id === id)) {
        data[DEFAULT_REFERENCE_DB_KEY] = _.filter(d, value => value.id !== id);
        if (data[DEFAULT_REFERENCE_DB_KEY].length === 0) {
          delete data[DEFAULT_REFERENCE_DB_KEY];
        }
      } else if (d && d.id === id) {
        delete data[DEFAULT_REFERENCE_DB_KEY];
      }
    });

    await this.saveData(allData);

    this.watcher$.next({
      method: 'DELETE',
      data: toReplace,
      _id: toReplace._id,
    });
    return toReplace;
  }

  listenOnChanges(): Observable<any> {
    return this.watcher$.pipe(
      filter(diff => diff),
      mergeMap(changesetOrChanges => {
        if (changesetOrChanges.changes) {
          return from(
            this.mapDiffToChangeset(
              changesetOrChanges.changes,
              changesetOrChanges.origin,
              changesetOrChanges.data,
            ),
          );
        }
        return of(changesetOrChanges);
      }),
    );
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
    return new ObjectID().toHexString();
  }

  private mapDiffToChangeset(changes: any, origin: any, data: any) {
    const changeset: Changeset[] = [];
    const addedIndexes = Object.keys(changes.added) || [];
    const deletedIndexes = Object.keys(changes.deleted) || [];
    const updatedIndexes = Object.keys(changes.updated) || [];
    _.uniq([...addedIndexes, ...deletedIndexes, ...updatedIndexes]).forEach(
      index => {
        const method = this.mapOperationType(
          addedIndexes,
          deletedIndexes,
          updatedIndexes,
          index,
        );
        const isDelete = method === 'DELETE';
        changeset.push({
          method,
          _id: isDelete
            ? origin[parseInt(index)]._id
            : data[parseInt(index)]._id,
          data: isDelete ? origin[parseInt(index)] : data[parseInt(index)],
        });
      },
    );
    return changeset;
  }
}
