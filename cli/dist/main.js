"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_ws_1 = require("@nestjs/platform-ws");
const commander_1 = require("commander");
const nestjs_1 = require("@norest/nestjs");
const _ = require("lodash");
const yargs_1 = require("yargs");
const program = new commander_1.Command();
const argv = _.cloneDeep(process.argv).splice(2);
const parsed = argv.includes('--help') || argv.includes('-h') ? argv : yargs_1.parse(argv);
const dotOptions = {};
const envOptions = {};
const enhancedOptionsName = ['connector', 'rest', 'auth', 'websocket'];
const envKeys = Object.keys(process.env).filter(key => key.startsWith('NOREST_'));
envKeys.forEach(key => {
    const value = process.env[key];
    const configKey = _.tail(key.split('_'))
        .map(k => _.camelCase(k))
        .join('.');
    _.set(envOptions, configKey, value);
});
async function bootstrap(port, config) {
    const app = await core_1.NestFactory.create(nestjs_1.NoRestModule.register(config));
    app.useWebSocketAdapter(new platform_ws_1.WsAdapter(app));
    await app.listen(port);
}
enhancedOptionsName.forEach(ns => {
    dotOptions[ns] = {};
    if (parsed[ns] && typeof parsed[ns] === 'object') {
        dotOptions[ns] = parsed[ns];
    }
});
process.argv = process.argv.filter(item => !enhancedOptionsName.some(ns => item.match(new RegExp(`^--${ns}\.`))));
program
    .version(require('../package.json').version)
    .command('start')
    .description('Start the noREST server.')
    .option('-p, --port <port>', 'Define the port to run at.')
    .option('--path <path>', 'The base path to expose the rest api (default: `api`)')
    .option('--fixed', 'Set this to true, to disallow adding new index fragments (default: `false`).')
    .option('--auth.<<prop>>', 'All configurations for the rest interface.')
    .option('--rest.<<prop>>', 'All configurations for the authentication.')
    .option('--websocket.<<prop>>', 'All configurations for websocket.')
    .option('--connector.<<prop>>', 'All configurations for the file or database connector.')
    .action(options => {
    const config = {
        path: options.path,
        fixed: options.fixed,
        connector: Object.assign(Object.assign({}, envOptions.connector), dotOptions.connector),
        auth: Object.assign(Object.assign({}, envOptions.auth), dotOptions.auth),
        websocket: Object.assign(Object.assign({}, envOptions.websocket), dotOptions.websocket),
        rest: Object.assign(Object.assign({}, envOptions.rest), dotOptions.rest),
    };
    bootstrap(options.port || 3030, config);
})
    .parse(process.argv);
//# sourceMappingURL=main.js.map