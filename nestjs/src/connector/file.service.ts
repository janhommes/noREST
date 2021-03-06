import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { detailedDiff } from 'deep-object-diff';
import { exists, readFile, writeFile } from 'fs';
import * as chokidar from 'chokidar';
import { _ } from 'lodash';
import { ObjectID } from 'mongodb';
import { isAbsolute, resolve } from 'path';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { promisify } from 'util';
import { DEFAULT_REFERENCE_DB_KEY } from '../common/constants';
import { Messages } from '../common/messages';
import { Changeset } from '../websocket/changeset.interface';
import { ConnectorConfig } from './connector-config.interface';
import { Connector } from './connector.interface';
import { List } from './list.interface';
import { Reference } from './reference.interface';

@Injectable()
export class FileService implements Connector {
  private readonly MAX_PAGE_SIZE = Infinity;
  private readonly FILE_WATCH_INTERVAL = 100;
  private path;
  private cachedData = [];
  private _readFile = promisify(readFile);
  private _writeFile = promisify(writeFile);
  private config: ConnectorConfig;

  async getData() {
    return this.cachedData;
  }

  async saveData(data) {
    await this._writeFile(this.path, JSON.stringify(data));
  }

  async init(config, collName) {
    this.config = config;
    const path = this.config.path || '.';
    if (isAbsolute(path)) {
      this.path = resolve(path, collName);
    } else {
      this.path = resolve(process.cwd(), path, collName);
    }

    const _exsists = promisify(exists);
    let data = [];
    if (
      !((await _exsists(this.path)) && this.config.createCollectionNotExisting)
    ) {
      await this._writeFile(this.path, '[]');
    } else {
      try {
        const fileData = await this._readFile(this.path, 'utf8');
        data = JSON.parse(fileData);
      } catch (ex) {
        throw new Error(`Failed to load file: ${this.path}`);
      }
    }
    this.cachedData = data;
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
      // FIXME: sometimes (if the id is not changed) a PUT is
      //        shown as PATCH.
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
    return toReplace;
  }

  listenOnChanges(): Observable<any> {
    const watcher$ = new BehaviorSubject(null);
    // TODO: add close() call!
    chokidar
      .watch(this.path, {
        interval: this.FILE_WATCH_INTERVAL,
        awaitWriteFinish: true,
      })
      .on('change', () => {
        this._readFile(this.path, 'utf8').then(d => {
          const json = JSON.parse(d);
          const changes = detailedDiff(this.cachedData, json);
          watcher$.next({
            changes,
            data: json,
            origin: this.cachedData,
          });
          this.cachedData = json;
        });
      });

    return watcher$.pipe(
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
