"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const messages_1 = require("./messages");
const constants_1 = require("./constants");
const cosmiconfig_1 = require("cosmiconfig");
const lodash_1 = require("lodash");
function normalizeSkipLimit(skip, limit) {
    skip = parseInt(`${skip}`, 10);
    limit = parseInt(`${limit}`, 10);
    if (isNaN(skip) || isNaN(limit) || skip < 0 || limit < 0) {
        throw new common_1.HttpException(messages_1.Messages.SKIP_QUERY_NO_POSITIVE_NUMBER, common_1.HttpStatus.PRECONDITION_FAILED);
    }
    return { skip, limit };
}
exports.normalizeSkipLimit = normalizeSkipLimit;
function normalizeFragment(frag) {
    return (frag || '').startsWith(constants_1.DEFAULT_INDEX_FRAGMENT_PREFIX)
        ? frag
        : `${constants_1.DEFAULT_INDEX_FRAGMENT_PREFIX}${frag}`;
}
exports.normalizeFragment = normalizeFragment;
function normalizeReference(frag) {
    return frag.startsWith(constants_1.DEFAULT_REFERENCE_PREFIX)
        ? frag
        : `${constants_1.DEFAULT_REFERENCE_PREFIX}${frag}`;
}
exports.normalizeReference = normalizeReference;
async function normalizeConfig(config) {
    const configExplorer = cosmiconfig_1.cosmiconfig('norest');
    const noRestFileConfig = await configExplorer.search();
    return lodash_1._.merge(constants_1.DEFAULT_CONFIG, noRestFileConfig ? noRestFileConfig.config : {}, config);
}
exports.normalizeConfig = normalizeConfig;
//# sourceMappingURL=normalize.js.map