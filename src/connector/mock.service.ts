import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { _ } from 'lodash';
import { Connector } from './connector.interface';
import { DbConfig } from './db-config.interface';
import { Request } from 'express';
import { Messages } from '../common/messages';
import { Reference } from './reference.interface';
import { List } from './list.interface';

@Injectable()
export class MockService implements Connector {
  private readonly MAX_PAGE_SIZE = Infinity;
  private data = [
    {
      _: {
        created: 'date',
        changed: 'date',
        owner: '1',
        changedBy: '2',
      },
      _id: '1',
      name: 'position5',
      '#_user': {
        mail: 'smth@do.de',
      },
    },
    {
      _: {
        created: 'date',
        changed: 'date',
        owner: '1',
        changedBy: '2',
      },
      _id: '2',
      name: 'position4',
      '#_product': {},
    },
    {
      _: {
        created: 'date',
        changed: 'date',
        owner: '1',
        changedBy: '2',
      },
      _id: '3',
      name: 'position3',
      '#_product': {},
      '@': [{ id: '7', fragment: '@_category' }],
    },
    {
      _: {
        created: 'date',
        changed: 'date',
        owner: '1',
        changedBy: '2',
      },
      _id: '4',
      name: 'position2',
      _option: {
        name: 'api-key',
        internal: 'I am a secret :)',
      },
    },
    {
      _: {
        created: 'date',
        changed: 'date',
        owner: '1',
        changedBy: '2',
      },
      _id: '5',
      name: 'position1',
      _key: 'test',
      '#_option': {
        name: 'api-key',
        internal: 'I am a secret :)',
      },
    },
    {
      _: {
        created: 'date',
        changed: 'date',
        owner: '1',
        changedBy: '2',
      },
      _id: '7',
      name: 'position7',
      '#_category': {
        name: 'api-key',
        internal: 'I am a secret :)',
      },
      '@': [{ id: '6', fragment: '@_category' }],
    },
    {
      _: {
        created: 'date',
        changed: 'date',
        owner: '1',
        changedBy: '2',
    },
      _id: '6',
      name: 'position1',
      '#_category': {
        name: 'api-key',
        internal: 'I am a secret :)',
      },
      '@': [{ id: '8', fragment: '@_product', oneToOne: true }],
    },
    {
      _: {
        created: 'date',
        changed: 'date',
        owner: '1',
        changedBy: '2',
      },
      _id: '8',
      name: 'position8',
      '#_product': {},
    },
  ];

  resolveCollection(req: Request) {
    // intended empty
  }

  connect(config: DbConfig) {
    Logger.log(`${config.name} connection established.`);
  }

  isIndex(fragment: any) {
    return this.data.find(value => _.has(value, fragment));
  }

  create(data: any) {
    if (!data._id) {
      data._id = this.createId();
    }
    this.data.push(data);
    return data;
  }

  read(id: string) {
    const result = this.data.find(items => items._id === id);
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

  list(skip: number, limit: number, orderBy?: string) {
    const data = this.getPaged(this.data, skip, limit);
    return Promise.resolve({
      _: {
        total: data.length,
        skip,
        limit,
      },
      data: this.order(data, orderBy),
    });
  }

  listByIndexFragment(
    fragment: string,
    skip?: number,
    limit?: number,
    orderBy?: string,
  ) {
    const data = this.order(this.getPaged(this.data.filter(value => {
      return _.has(value, fragment);
    }), skip, limit), orderBy);
    return Promise.resolve({
      _: {
        total: data.length,
        skip,
        limit,
      },
      data,
    });
  }

  listByRef(
    references: Reference[],
    skip: number = 0,
    limit: number = this.MAX_PAGE_SIZE,
  ): Promise<List> {
    const data = this.getPaged(this.data.filter(value => {
      // tslint:disable-next-line: triple-equals
      return references.some((r) => r.id == value._id);
    }), skip, limit);
    return Promise.resolve({
      _: {
        total: data.length,
        skip,
        limit,
      },
      data,
    });
  }

  update(id: string, data: any) {
    const toReplace = this.read(id);
    data._id = id;
    this.data[this.data.indexOf(toReplace)] = data;
    return data;
  }

  delete(id: string) {
    const toReplace = this.read(id);
    this.data.splice(this.data.indexOf(toReplace), 1);
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
