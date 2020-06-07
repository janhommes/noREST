/// <reference types="node" />
import { HttpAdapterHost } from '@nestjs/core';
import { OnGatewayConnection } from '@nestjs/websockets';
import * as http from 'http';
import { Observable } from 'rxjs';
import * as Ws from 'ws';
import { ConnectorService } from '../connector/connector.service';
import { PrivateInterceptor } from '../auth/interceptors/private.interceptor';
import { NoRestConfig } from '../norest-config.interface';
export declare class WebsocketGateway implements OnGatewayConnection<Ws> {
    private noRestConfig;
    private httpServerRef;
    private privateDataInterceptor;
    private database;
    server: Ws.Server;
    constructor(connector: ConnectorService, noRestConfig: NoRestConfig, httpServerRef: HttpAdapterHost, privateDataInterceptor: PrivateInterceptor);
    handleConnection(client: Ws, msg: http.IncomingMessage): Promise<void>;
    onEvent(client: Ws, eventDate: any): Promise<Observable<any>>;
    private resolveDetailChanges;
    private resolveListChanges;
}
