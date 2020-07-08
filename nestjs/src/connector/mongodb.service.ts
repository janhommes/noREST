import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { _ } from 'lodash';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DEFAULT_INDEX_FRAGMENT_PREFIX,
  DEFAULT_REFERENCE_DB_IDENTIFIER_KEY,
  DEFAULT_REFERENCE_DB_KEY,
} from '../common/constants';
import { Messages } from '../common/messages';
import { Changeset } from '../websocket/changeset.interface';
import { Connector } from './connector.interface';
import { ConnectorConfig } from './connector-config.interface';
import { Reference } from './reference.interface';

@Injectable()
export class MongoDbService implements Connector {
  private collection: Collection;
  private indexFragments: string[] = [];
  private client: MongoClient;

  async init(
    client: MongoClient,
    collectionName: string,
    config: ConnectorConfig
  ) {
    try {
      this.client = client;
      this.collection = client.db().collection(collectionName);
      this.indexFragments = await this.getIndexFragments();
    } catch (ex) {
      if (config.createCollectionNotExisting && ex.code === 26) {
        this.collection = await client.db().createCollection(collectionName);
        this.indexFragments = await this.getIndexFragments();
      } else {
        throw ex;
      }
    }
  }

  destroy() {
    this.client.close();  
  }

  listenOnChanges() {
    const watcher$ = fromEvent(this.collection.watch(), 'change');
    return watcher$.pipe(
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
          } as Changeset),
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
      // a ws return (wasn't that fixed already?!)
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

  async update(id: string, data: any, partialData?: any) {
    if (partialData) {
      await this.collection.findOneAndUpdate(
        { _id: this.getObjectIdIfValid(id) },
        { $set: { ...partialData } },
        { upsert: true },
      );
    } else {
      await this.collection.findOneAndReplace(
        { _id: this.getObjectIdIfValid(id) },
        data,
      );
    }
    this.setIndexFragments(data);
    return { _id: id, ...data };
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

  private async getIndexFragments() {
    // TODO: think of caching the indexes!
    return _.filter(await this.collection.indexes(), val =>
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
