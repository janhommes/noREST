import { NoRestConfig } from '../norest-config.interface';
import { ConnectorType } from '../connector/connector-type.enum';
export declare const NOREST_CONFIG_TOKEN = "NOREST_CONFIG";
export declare const NOREST_AUTH_CONFIG_TOKEN = "NOREST_AUTH_CONFIG";
export declare const NOREST_REST_CONFIG_TOKEN = "NOREST_REST_CONFIG";
export declare const NOREST_CONNECTOR_CONFIG_TOKEN = "NOREST_CONNECTOR_CONFIG";
export declare const NOREST_WEBSOCKET_CONFIG_TOKEN = "NOREST_WEBSOCKET_CONFIG";
export declare const DB_CONNECTOR_TOKEN = "DB_CONNECTOR_TOKEN";
export declare const DB_CONNECTION_TOKEN = "DB_CONNECTION_TOKEN";
export declare const REFLECTION_NESTJS_CONTROLLER_PATH = "path";
export declare const DEFAULT_INDEX_FRAGMENT_PREFIX = "#_";
export declare const DEFAULT_REFERENCE_PREFIX = "@_";
export declare const DEFAULT_REFERENCE_DB_KEY = "@";
export declare const DEFAULT_REFERENCE_DB_IDENTIFIER_KEY = "id";
export declare const DEFAULT_PAGE_SIZE = 100;
export declare const AUTH_CONFIG_DEFAULTS: {
    userProperty: string;
    cookieName: string;
};
export declare const CONNECTOR_CONFIG_DEFAULTS: {
    name: ConnectorType;
    url: string;
    path: string;
    collection: string;
    createCollectionNotExisting: boolean;
};
export declare const REST_CONFIG_DEFAULTS: {
    defaultPageSize: number;
};
export declare const WEBSOCKET_DEFAULT_CONFIG: {
    enabled: boolean;
};
export declare const DEFAULT_CONFIG: NoRestConfig;
