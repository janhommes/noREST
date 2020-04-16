import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { _ } from 'lodash';
import { Connector } from './connector.interface';
import { DbConfig } from './db-config.interface';
import { MongoClient, ObjectId, Collection } from 'mongodb';
import { Request } from 'express';
import {
  DEFAULT_INDEX_FRAGMENT_PREFIX,
  DEFAULT_REFERENCE_DB_IDENTIFIER_KEY,
  DEFAULT_REFERENCE_DB_KEY,
} from '../common/constants';
import { Messages } from '../common/messages';
import { Reference } from './reference.interface';
import { bindCallback, fromEvent, Observable, pipe } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ChangesetInterface } from './changeset.interface';

@Injectable()
export class MongoDbService implements Connector {
  private connection: MongoClient;
  private collection: Collection;
  private config: DbConfig;
  private indexFragments: string[] = [];
  private watcher$;

  listenOnChanges() {
    return this.watcher$.pipe(
      map(
        (change: any) =>
          ({
            _id: change.documentKey._id.toHexString(),
            method: this.mapOperationType(change.operationType),
            data: change.fullDocument
              ? {
                  ...change.fullDocument,
                  _id: change.documentKey._id.toHexString(),
                }
              : undefined,
          } as ChangesetInterface),
      ),
    );
  }

  private mapOperationType(
    operationType: any,
  ): 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT' {
    switch (operationType) {
      case 'insert': {
        return 'POST';
      }
      // TODO: Issue with POST vs. PUT. As we only use
      // replace, PATCH is never referenced correctly in
      // a ws return
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

  async connect(config: DbConfig) {
    this.config = config;
    try {
      this.connection = await new MongoClient(config.url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();

      await this.resolveCollection();

      this.watcher$ = fromEvent(this.collection.watch(), 'change');

      Logger.log(`${config.name} connection established at url: ${config.url}`);
      return this.connection;
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async resolveCollection(req?: Request) {
    const collName = this.getCollectionName(req);
    try {
      this.collection = this.connection.db().collection(collName);
      this.indexFragments = await this.getIndexFragments();
    } catch (ex) {
      if (this.config.createCollectionNotExisting && ex.code === 26) {
        this.collection = await this.connection.db().createCollection(collName);
        this.indexFragments = await this.getIndexFragments();
      } else {
        throw ex;
      }
    }
  }

  async isIndex(fragment: any) {
    if (!this.indexFragments) {
      this.indexFragments = await this.getIndexFragments();
    }
    return this.indexFragments.indexOf(fragment) > -1;
  }

  async create(data: any) {
    const newData = { _id: new ObjectId(), ...data };
    await this.collection.insertOne(newData);
    await this.setIndexFragments(newData);
    return newData;
  }

  async read(id: string) {
    const result = await this.collection.findOne({
      _id: this.getObjectIdIfValid(id),
    });
    return result;
  }

  async readByKey(fragment: string, key: string) {
    const result = await this.read(key);
    if (!result) {
      const results = await this.listByIndexFragment(fragment, 0, 0);
      return results.data.find(data =>
        // tslint:disable-next-line: triple-equals
        _.find(data, (val, k) => k.startsWith('_') && val == key),
      );
    }
    if (!_.has(result, fragment)) {
      return;
    }
    return result;
  }

  async list(skip: number, limit: number, orderBy?: string) {
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

  async listByIndexFragment(
    fragment: string,
    skip: number,
    limit: number,
    orderBy?: string,
  ) {
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

  async listByRef(
    references: Reference[],
    skip: number,
    limit: number,
    orderBy?: string,
  ) {
    const sortFilter = this.createSearchFilter(orderBy);
    const refIds = _.map(references, ref => this.getObjectIdIfValid(ref.id));
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

  async update(id: string, data: any) {
    await this.collection.findOneAndReplace(
      { _id: this.getObjectIdIfValid(id) },
      data,
    );
    this.setIndexFragments(data);
    return data;
  }

  async delete(id: string) {
    const result = await this.collection.findOneAndDelete({
      _id: this.getObjectIdIfValid(id),
    });

    const references = await this.collection
      .find({
        [`${DEFAULT_REFERENCE_DB_KEY}.${DEFAULT_REFERENCE_DB_IDENTIFIER_KEY}`]: `${id}`,
      })
      .toArray();

    await references.forEach(async data => {
      data[DEFAULT_REFERENCE_DB_KEY] = data[DEFAULT_REFERENCE_DB_KEY].filter(
        ref => ref === `${id}`,
      );
      if (data[DEFAULT_REFERENCE_DB_KEY].length === 0) {
        delete data[DEFAULT_REFERENCE_DB_KEY];
      }
      await this.update(`${data._id}`, data);
    });

    return result.value;
  }

  private getCollectionName(req?: Request) {
    if (_.isString(this.config.collection)) {
      return this.config.collection as string;
    }
    return (this.config.collection as Function)(req) as string;
  }

  private async getIndexFragments() {
    return _.filter(await this.collection.indexes(), (val, k) =>
      val.name.startsWith(DEFAULT_INDEX_FRAGMENT_PREFIX),
    ).map(({ key }) => Object.keys(key)[0]);
  }

  private async setIndexFragments(data) {
    const newIndexes = _.map(
      data,
      (val, key) =>
        key.startsWith(DEFAULT_INDEX_FRAGMENT_PREFIX) &&
        !this.indexFragments.find(k => k === key) && { key: { [key]: 1 } },
    ).filter(Boolean);
    if (newIndexes.length > 0) {
      await this.collection.createIndexes(newIndexes);
      this.indexFragments = await this.getIndexFragments();
    }
  }

  private getObjectIdIfValid(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : id;
  }

  private createSearchFilter(orderBy?: string) {
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
      } catch (ex) {
        throw new HttpException(
          Messages.VALIDATION_ORDER,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
