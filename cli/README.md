# Install

Get it from npm:

```
npm i @norest/cli -g
```

# Getting started

Spin up a default server (file system storage):

```
norest
```

## Configuration
Or configure it to your needs:
 - `-p`      = Which port to use (default: `3030`)
 - `--fixed` = Set this to true, to disallow adding new index fragments (default: `false`).
 - `--path`  = The base path to expose the rest api (default: `api`).
 - `--websocket.<<prop>>` = All [configurations for websocket](/blob/master/nestjs/src/websocket/websocket-config.interface.ts).
 - `--rest.<<prop>>`      = All [configurations for the rest interface](/blob/master/nestjs/src/rest/rest-config.interface.ts).
 - `--auth.<<prop>>`      = All [configurations for the authentication](/blob/master/nestjs/src/auth/auth-config.interface.ts).
 - `--connector.<<prop>>` = All [configurations for the file or database connector](/blob/master/nestjs/nestjs/src/connector/connector-config.interface.ts).


Example to start with authentication enabled:
```
norest serve --auth.enabled true
```


Example to start with a Mongo DB:
```
norest serve --connector.name mongodb --connector.url "mongodb://127.0.0.1:27017/test"
```

> Note: NoREST only works with mongodb Sharding, single mongodb nodes are not supported.

## Configuration file
You could also create a .norestrc.json, yaml or .js in the root directory and store/export the configuration there.
```
{
  "connector": {
    "name": "mongodb",
    "url": "mongodb://127.0.0.1:27017/test",
    "collection": "norest",
    "createCollectionNotExisting": true
  },
  "websocket": {
    "enabled": true
  },
  "auth": {
    "cookieName": "auth",
    "userProperty": "sub"    
  },
  "path": "api",
  "fixed": false
}

```

> By default the noREST nestjs implementation supports two connectors: mongoDB and file. File is the default configuration but only suitable for non high load.

## Env variables
Each of the mentioned configuration can be also be parsed as a ENV var. Use the prefix `NOREST_` and replace dots with underscores then:

```
env.NOREST_AUTH_COOKIENAME = "authorization"
```