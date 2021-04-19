import { ConnectorConfig } from './connector/connector-config.interface';
import { AuthConfig } from './auth/auth-config.interface';
import { RestConfig } from './rest/rest-config.interface';
import { WebsocketConfig } from './websocket/websocket-config.interface';
import { DynamicModule } from '@nestjs/common';

export interface NoRestConfig {
  connector: ConnectorConfig;
  auth: AuthConfig;
  rest: RestConfig;
  websocket: WebsocketConfig;
  plugins?: DynamicModule[];
  path: string;
  fixed: boolean;
  cors: boolean | {};
  port: number;
}
