import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { Command } from 'commander';
import { NoRestConfig, NoRestModule } from '@norest/nestjs';
import yargs = require('yargs');

const program = new Command();
let argv = process.argv;
const parsed = yargs(argv.slice(2)).parse(argv);
const dotOptions: Partial<NoRestConfig> = {};
const enhancedOptionsName = ['connector', 'rest', 'auth', 'websocket'];

async function bootstrap(port, config: NoRestConfig) {
  const app = await NestFactory.create(NoRestModule.register(config));
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(port);
}

enhancedOptionsName.forEach(ns => {
  dotOptions[ns] = {};
  if (parsed[ns] && typeof parsed[ns] === 'object') {
    dotOptions[ns] = parsed[ns];
  }
});
argv = argv.filter(
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
      connector: dotOptions.connector,
      auth: dotOptions.auth,
      websocket: dotOptions.websocket,
      rest: dotOptions.rest,
    };
    bootstrap(options.port || 3030, config);
  })
  .parse(argv);