"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Messages;
(function (Messages) {
    Messages["API_FIXED"] = "The API is fixed. New index fragments cannot be created and the base route access is not permitted.";
    Messages["NOT_FOUND"] = "Entity not found";
    Messages["NO_REF_FOUND"] = "Reference not found";
    Messages["NO_REF_FOUND_CREATE"] = "Reference not found for: ";
    Messages["NO_ROUTE_FOUND"] = "Route not found";
    Messages["NO_INDEX_SET"] = "No index fragment set";
    Messages["VALIDATION_CONFLICT"] = "The given entity conflicts with an existing one";
    Messages["VALIDATION_METADATA_IMMUTABLE"] = "Adding or changing metadata is not allowed";
    Messages["VALIDATION_READABLE_IMMUTABLE"] = "Changing readonly properties (prefixed with '_') is not allowed.";
    Messages["VALIDATION_DUPLICATED_ID"] = "Duplicated id";
    Messages["SKIP_QUERY_NO_POSITIVE_NUMBER"] = "The skip and query parameter needs to be a positive number.";
    Messages["VALIDATION_ORDER"] = "Invalid orderBy query parameter";
    Messages["INVALID_JWT"] = "The given authorization is not a valid JWT.";
})(Messages = exports.Messages || (exports.Messages = {}));
//# sourceMappingURL=messages.js.map