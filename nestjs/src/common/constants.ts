import { NoRestConfig } from '../norest-config.interface';
import { ConnectorType } from '../connector/connector-type.enum';

export const NOREST_CONFIG_TOKEN = 'NOREST_CONFIG';
export const NOREST_AUTH_CONFIG_TOKEN = 'NOREST_AUTH_CONFIG';
export const NOREST_REST_CONFIG_TOKEN = 'NOREST_REST_CONFIG';
export const NOREST_CONNECTOR_CONFIG_TOKEN = 'NOREST_CONNECTOR_CONFIG';
export const NOREST_WEBSOCKET_CONFIG_TOKEN = 'NOREST_WEBSOCKET_CONFIG';
// export const DB_CONFIG_TOKEN = 'DB_CONFIG_TOKEN';
export const DB_CONNECTOR_TOKEN = 'DB_CONNECTOR_TOKEN';
export const DB_CONNECTION_TOKEN = 'DB_CONNECTION_TOKEN';
export const REFLECTION_NESTJS_CONTROLLER_PATH = 'path';
export const DEFAULT_INDEX_FRAGMENT_PREFIX = '#_';
export const DEFAULT_REFERENCE_PREFIX = '@_';
export const DEFAULT_REFERENCE_DB_KEY = '@';
export const DEFAULT_REFERENCE_DB_IDENTIFIER_KEY = 'id';
export const DEFAULT_PAGE_SIZE = 100;
export const AUTH_CONFIG_DEFAULTS = {
  userProperty: 'sub',
  cookieName: 'auth',
  // TODO: Add a jwt validation
  /*jwtValidation: false,
  mode: '',
  secret: '',*/
};
export const CONNECTOR_CONFIG_DEFAULTS = {
  name: ConnectorType.File,
  url: '',
  path: './',
  collection: 'norest',
  createCollectionNotExisting: true,
};
export const REST_CONFIG_DEFAULTS = {
  defaultPageSize: DEFAULT_PAGE_SIZE,
};
export const WEBSOCKET_DEFAULT_CONFIG = {
  enabled: true,
};
export const DEFAULT_CONFIG: NoRestConfig = {
  connector: CONNECTOR_CONFIG_DEFAULTS,
  websocket: WEBSOCKET_DEFAULT_CONFIG,
  auth: AUTH_CONFIG_DEFAULTS,
  rest: REST_CONFIG_DEFAULTS,
  path: 'api',
  fixed: false,
  cors: true,
};
