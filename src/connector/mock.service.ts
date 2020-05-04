import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { _ } from 'lodash';
import { Connector } from './connector.interface';
import { DbConfig } from './db-config.interface';
import { Request } from 'express';
import { Messages } from '../common/messages';
import { Reference } from './reference.interface';
import { List } from './list.interface';
import { Observable, BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';
import { Changeset } from './changeset.interface';

@Injectable()
export class MockService implements Connector {
  private readonly MAX_PAGE_SIZE = Infinity;
  private data = [];
  private watcher$: BehaviorSubject<Changeset> = new BehaviorSubject(null);

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
    this.watcher$.next({
      method: 'POST',
      data: data,
      _id: data._id,
    });
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
        total: this.data.length,
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
    const data = this.data.filter(value => {
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

  listByRef(
    references: Reference[],
    skip: number = 0,
    limit: number = this.MAX_PAGE_SIZE,
  ): Promise<List> {
    const data = this.data.filter(value => {
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

  update(id: string, data: any, partialData: any) {
    const toReplace = this.read(id);
    data._id = id;
    this.data[this.data.indexOf(toReplace)] = data;
    this.watcher$.next({
      method: partialData ? 'PATCH' : 'PUT',
      data,
      _id: data._id,
    });
    return data;
  }

  delete(id: string) {
    const toReplace = this.read(id);
    this.data.splice(this.data.indexOf(toReplace), 1);
    this.watcher$.next({
      method: 'DELETE',
      data: toReplace,
      _id: toReplace._id,
    });
    return toReplace;
  }

  listenOnChanges(): Observable<any> {
    return this.watcher$.pipe(skip(1));
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
