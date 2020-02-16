import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { _ } from 'lodash';
import { Connector } from './connector.interface';
import { DbConfig } from './db-config.interface';
import { MongoClient, ObjectID, Collection } from 'mongodb';
import { Request } from 'express';
import {
  DEFAULT_INDEX_FRAGMENT_PREFIX,
  DEFAULT_REFERENCE_DB_IDENTIFIER_KEY,
  DEFAULT_REFERENCE_DB_KEY,
} from '../common/constants';
import { Messages } from '../common/messages';
import { Reference } from './reference.interface';

@Injectable()
export class MongoDbService implements Connector {
  private connection: MongoClient;
  private collection: Collection;
  private config: DbConfig;
  private indexFragments: string[] = [];

  async connect(config: DbConfig) {
    this.config = config;
    try {
      this.connection = await new MongoClient(config.url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        autoReconnect: true,
      }).connect();
      if (_.isString(config.collection)) {
        this.collection = this.connection
          .db()
          .collection(config.collection as string);
        this.indexFragments = await this.getIndexFragments();
      }
      Logger.log(`${config.name} connection established at url: ${config.url}`);
      return this.connection;
    } catch (ex) {
      throw new Error(ex);
    }
  }

  resolveCollection(req: Request) {
    if (_.isString(this.config.collection)) {
      this.connection.db().collection(this.config.collection as string);
    } else {
      const collName = (this.config.collection as Function)(req);
      this.collection = this.connection.db().collection(collName);
    }
  }

  async isIndex(fragment: any) {
    if (!this.indexFragments) {
      this.indexFragments = await this.getIndexFragments();
    }
    return this.indexFragments.indexOf(fragment) > -1;
  }

  async create(data: any) {
    const newData = { _id: new ObjectID(), ...data };
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
    return ObjectID.isValid(id) ? new ObjectID(id) : id;
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
