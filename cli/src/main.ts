import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { Command } from 'commander';
import { NoRestConfig, NoRestModule } from '@norest/nestjs';
import * as _ from 'lodash';
import { parse } from 'yargs';

const program = new Command();
const argv: any[] = _.cloneDeep(process.argv).splice(2);
const parsed =
  argv.includes('--help') || argv.includes('-h') ? argv : parse(argv);
const dotOptions: Partial<NoRestConfig> = {};
const envOptions: Partial<NoRestConfig> = {};
const enhancedOptionsName = ['connector', 'rest', 'auth', 'websocket'];
const envKeys = Object.keys(process.env).filter(key =>
  key.startsWith('NOREST_'),
);

envKeys.forEach(key => {
  const value = process.env[key];
  const configKey = _.tail(key.split('_'))
    .map(k => _.camelCase(k))
    .join('.');
  _.set(envOptions, configKey, value);
});

async function bootstrap(port, config: NoRestConfig) {
  const app = await NestFactory.create(NoRestModule.register(config), { cors: config.cors });
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(port);
}

enhancedOptionsName.forEach(ns => {
  dotOptions[ns] = {};
  if (parsed[ns] && typeof parsed[ns] === 'object') {
    dotOptions[ns] = parsed[ns];
  }
});
process.argv = process.argv.filter(
  item => !enhancedOptionsName.some(ns => item.match(new RegExp(`^--${ns}\.`))),
);

program
  .version(require('../package.json').version)
  .command('start')
  .description('Start the noREST server.')
  .option('-p, --port <port>', 'Define the port to run at.')
  .option(
    '--path <path>',
    'The base path to expose the rest api (default: `api`)',
  )
  .option(
    '--fixed',
    'Set this to true, to disallow adding new index fragments (default: `false`).',
  )
  .option(
    '--cors',
    'Set this to false, to disable cors (default: `true`).',
    true
  )
  .option('--auth.<<prop>>', 'All configurations for the rest interface.')
  .option('--rest.<<prop>>', 'All configurations for the authentication.')
  .option('--websocket.<<prop>>', 'All configurations for websocket.')
  .option(
    '--connector.<<prop>>',
    'All configurations for the file or database connector.',
  )
  .action(options => {
    const config: NoRestConfig = {
      path: options.path,
      fixed: options.fixed,
      cors: options.cors,
      connector: { ...envOptions.connector, ...dotOptions.connector },
      auth: { ...envOptions.auth, ...dotOptions.auth },
      websocket: { ...envOptions.websocket, ...dotOptions.websocket },
      rest: { ...envOptions.rest, ...dotOptions.rest },
    };    
    bootstrap(options.port || 3030, config);
  })
  .parse(process.argv);
