import { Inject, UseInterceptors } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as http from 'http';
import { _ } from 'lodash';
import * as fetch from 'node-fetch';
import { from, Observable, of } from 'rxjs';
import { map, mergeMap, startWith } from 'rxjs/operators';
import * as Ws from 'ws';
import { NOREST_CONFIG_TOKEN } from '../common/constants';
import { normalizeFragment } from '../common/normalize';
import { Changeset } from './changeset.interface';
import { Request } from 'express';
import { ConnectorFactory } from '../connector/connector.interface';
import { ConnectorService } from '../connector/connector.service';
import { PrivateInterceptor } from '../auth/interceptors/private.interceptor';
import { ReferenceInterceptor } from '../auth/interceptors/reference.interceptor';
import { NoRestConfig } from '../norest-config.interface';

@WebSocketGateway()
@UseInterceptors(PrivateInterceptor)
@UseInterceptors(ReferenceInterceptor)
export class WebsocketGateway implements OnGatewayConnection<Ws> {
  private database: ConnectorFactory;

  @WebSocketServer()
  server: Ws.Server;

  constructor(
    connector: ConnectorService,
    @Inject(NOREST_CONFIG_TOKEN) private noRestConfig: NoRestConfig,
    private httpServerRef: HttpAdapterHost,
    private privateDataInterceptor: PrivateInterceptor,
  ) {
    this.database = connector.connectorFactory;
  }

  async handleConnection(client: Ws, msg: http.IncomingMessage) {
    const url = new URL(msg.url, `http://${msg.headers.host}`);
    const sub = {
      event: 'subscribe',
      data: {
        channel: `${url.origin}${msg.url}`,
        headers: msg.headers,
      },
    };

    setTimeout(() => {
      client.emit('message', JSON.stringify(sub));
    });
  }

  @SubscribeMessage('subscribe')
  async onEvent(client: Ws, eventDate: any): Promise<Observable<any>> {
    const { channel, headers } = eventDate;

    // TODO: allow relative urls by getting the url from here:
    // this.httpServerRef.httpAdapter.getInstance()

    const url = new URL(channel, `http://${headers.host}`);
    const pathParts = url.pathname.split('/');
    const baseIndex = pathParts.indexOf(
      pathParts.find(path => path === this.noRestConfig.path),
    );

    // TODO: this needs proper testing!
    const fragment = pathParts[baseIndex + 1];
    const id = pathParts[baseIndex + 2];
    const ref = pathParts[baseIndex + 3];

    delete headers.upgrade;

    const dbClient = await this.database.resolveConnector(
      { url: url.toString(), headers },
      this.noRestConfig.connector,
    );

    return from(fetch(channel, { headers })).pipe(
      mergeMap((res: Response) => res.json()),
      map(response => {
        // TODO: this is a error case, figure out why it
        // is not working properly
        if (response.statusCode) {
          return { ...response, method: 'GET', channel };
        }

        return {
          ...response,
          _: { ...response._, method: 'GET', channel },
        };
      }),
      mergeMap(response => {
        if (response.statusCode) {
          return of(response);
        }
        return dbClient
          .listenOnChanges(normalizeFragment(fragment), id, ref)
          .pipe(
            startWith({}),
            map((change: Changeset) => {
              if (response._id && response._id === change._id) {
                return this.resolveDetailChanges(response, change, channel);
              } else if (response.data && change._id) {
                return this.resolveListChanges(response, change, channel);
              }
              return response;
            }),
          );
      }),
    );
  }

  private resolveDetailChanges(
    response: any,
    change: Changeset,
    channel: string,
  ) {
    if (change.method === 'DELETE') {
      return {
        _: { method: change.method, channel, origin: response },
        _id: response._id,
      };
    }
    change.data._ = {
      ...change.data._,
      method: change.method,
      channel,
      origin: response,
    };
    return change.data;
  }

  private resolveListChanges(
    response: any,
    change: Changeset,
    channel: string,
  ) {
    let index = _.findIndex(response.data, item => item._id === change._id);

    if (index > -1 && change.method === 'DELETE') {
      change.data = response.data[index];
      response.data.splice(index, 1);
    } else if (
      index > -1 &&
      (change.method === 'PUT' || change.method === 'PATCH')
    ) {
      const temp = response.data[index];
      response.data[index] = change.data;
      change.data = temp;
    } else if (change.method === 'POST') {
      /// IDEA: Decide to prepend or append based on orderby filter?!
      response.data = [...response.data, change.data];
      index = response.data.length - 1;
    } else {
      return;
    }

    return {
      _: {
        ...response._,
        method: change.method,
        channel,
        new:
          change.method === 'DELETE'
            ? undefined
            : this.privateDataInterceptor.omit(response.data[index]),
        origin: change.method === 'POST' ? undefined : change.data,
      },
      data: response.data,
    };
  }
}
