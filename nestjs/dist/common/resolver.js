"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_factory_1 = require("../connector/mongodb.factory");
function resolveConnector(name, defaultConnector) {
    if (!defaultConnector) {
        switch (name.toLowerCase()) {
            case "mongodb":
                return new mongodb_factory_1.MongoDbFactory();
        }
    }
    return defaultConnector;
}
exports.resolveConnector = resolveConnector;
//# sourceMappingURL=resolver.js.map