"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mock_service_1 = require("../connector/mock.service");
const mongodb_service_1 = require("../connector/mongodb.service");
const file_service_1 = require("../connector/file.service");
function resolveConnector(name, defaultConnector) {
    if (!defaultConnector) {
        switch (name.toLowerCase()) {
            case "mock":
                return new mock_service_1.MockService();
            case "mongodb":
                return new mongodb_service_1.MongoDbService();
            case "file":
                return new file_service_1.FileService();
        }
    }
    return defaultConnector;
}
exports.resolveConnector = resolveConnector;
//# sourceMappingURL=resolver.js.map