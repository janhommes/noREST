"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const connector_type_enum_1 = require("../../connector/connector-type.enum");
const auth_guard_1 = require("../../auth/auth.guard");
const auth_service_1 = require("../../auth/auth.service");
const constants_1 = require("../../common/constants");
const connector_service_1 = require("../../connector/connector.service");
const file_service_1 = require("../../connector/file.service");
const mock_service_1 = require("../../connector/mock.service");
const mongodb_service_1 = require("../../connector/mongodb.service");
const rest_controller_1 = require("../../rest/rest.controller");
exports.createFakeData = async (restController, reqMock) => {
    const fakeData = [
        {
            _id: '1',
            name: 'position5',
            '#_user': {
                mail: 'smth@do.de',
            },
        },
        {
            _id: '2',
            name: 'position4',
            '#_product': {},
        },
        {
            _id: '3',
            name: 'position3',
            '#_product': {},
        },
        {
            _id: '4',
            name: 'position2',
            '#_option': {
                name: 'api-key',
                internal: 'I am a secret :)',
            },
        },
        {
            _id: '5',
            name: 'position1',
            _key: 'test',
            '#_option': {
                name: 'api-key',
                internal: 'I am a secret :)',
            },
        },
        {
            _id: '7',
            name: 'position7',
            '#_category': {
                name: 'api-key',
                internal: 'I am a secret :)',
            },
        },
        {
            _id: '6',
            name: 'position1',
            '#_category': {
                name: 'api-key',
                internal: 'I am a secret :)',
            },
        },
        {
            _id: '8',
            name: 'position8',
            '#_product': {},
        },
    ];
    for (const data of fakeData) {
        try {
            await restController.create(data, reqMock);
        }
        catch (ex) {
            console.log(ex);
        }
    }
};
exports.prepare = async () => {
    const config = {
        connector: {
            name: "mock",
            url: 'mongodb://127.0.0.1:27017/test',
            collection: 'testme_' + Math.random(),
            path: '../../dist/test',
            createCollectionNotExisting: true,
        },
        auth: {
            userProperty: 'sub',
            cookieName: 'auth',
        },
        rest: {
            defaultPageSize: 100,
        },
        websocket: {
            enabled: true,
        },
        path: 'api',
        fixed: false,
    };
    const module = await testing_1.Test.createTestingModule({
        controllers: [rest_controller_1.RestController],
        providers: [
            {
                provide: constants_1.NOREST_CONFIG_TOKEN,
                useValue: config,
            },
            {
                provide: constants_1.NOREST_CONNECTOR_CONFIG_TOKEN,
                useValue: config.connector,
            },
            auth_service_1.AuthService,
            auth_guard_1.AuthGuard,
            mock_service_1.MockService,
            mongodb_service_1.MongoDbService,
            connector_service_1.ConnectorService,
            file_service_1.FileService,
            {
                provide: constants_1.DB_CONNECTOR_TOKEN,
                useExisting: mock_service_1.MockService,
            },
            {
                provide: constants_1.DB_CONNECTION_TOKEN,
                useFactory: async (connector, config) => {
                    const connection = await connector.connect(config);
                    return connection;
                },
                inject: [constants_1.DB_CONNECTOR_TOKEN, constants_1.NOREST_CONNECTOR_CONFIG_TOKEN],
            },
        ],
    }).compile();
    return { module };
};
//# sourceMappingURL=_prepare.js.map