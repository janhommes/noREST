"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOREST_CONFIG_TOKEN = 'NOREST_CONFIG';
exports.NOREST_AUTH_CONFIG_TOKEN = 'NOREST_AUTH_CONFIG';
exports.NOREST_REST_CONFIG_TOKEN = 'NOREST_REST_CONFIG';
exports.NOREST_CONNECTOR_CONFIG_TOKEN = 'NOREST_CONNECTOR_CONFIG';
exports.NOREST_WEBSOCKET_CONFIG_TOKEN = 'NOREST_WEBSOCKET_CONFIG';
exports.DB_CONNECTOR_TOKEN = 'DB_CONNECTOR_TOKEN';
exports.DB_CONNECTION_TOKEN = 'DB_CONNECTION_TOKEN';
exports.REFLECTION_NESTJS_CONTROLLER_PATH = 'path';
exports.DEFAULT_INDEX_FRAGMENT_PREFIX = '#_';
exports.DEFAULT_REFERENCE_PREFIX = '@_';
exports.DEFAULT_REFERENCE_DB_KEY = '@';
exports.DEFAULT_REFERENCE_DB_IDENTIFIER_KEY = 'id';
exports.DEFAULT_PAGE_SIZE = 100;
exports.AUTH_CONFIG_DEFAULTS = {
    userProperty: 'sub',
    cookieName: 'auth',
};
exports.CONNECTOR_CONFIG_DEFAULTS = {
    name: "file",
    url: '',
    path: './',
    collection: 'norest',
    createCollectionNotExisting: true,
};
exports.REST_CONFIG_DEFAULTS = {
    defaultPageSize: exports.DEFAULT_PAGE_SIZE,
};
exports.WEBSOCKET_DEFAULT_CONFIG = {
    enabled: true,
};
exports.DEFAULT_CONFIG = {
    connector: exports.CONNECTOR_CONFIG_DEFAULTS,
    websocket: exports.WEBSOCKET_DEFAULT_CONFIG,
    auth: exports.AUTH_CONFIG_DEFAULTS,
    rest: exports.REST_CONFIG_DEFAULTS,
    path: 'api',
    fixed: false,
};
//# sourceMappingURL=constants.js.map