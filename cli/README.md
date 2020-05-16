# Install

Get it from npm:

```
npm i @norest/cli -g
```

# Getting started

Spin up a default server:

```
norest
```

## Configuration
Or configure it to your needs:

`-p`      = Which port to use (default: `3000`)
`--fixed` = Set this to true, to disallow adding new index fragments (default: `false`).
`--path`  = The base path to expose the rest api (default: `api`).
`--websocket.<<prop>>` = All configurations for websocket.
`--rest.<<prop>>`      = All configurations for the rest interface.
`--auth.<<prop>>`      = All configurations for the authentication.
`--connector.<<prop>>` = All configurations for the file or database connector.


Example to start with a Mongo DB:
```
norest serve --connector.name mongodb --connector.url "mongodb://127.0.0.1:27017/test"
```

> Note: NoREST only works with mongodb Sharding, single mongodb nodes are not supported.

## Configuration file
You could also create a .norestrc.json or yaml in the root directory and store the configuration there.
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

## Env variables
Each of the mentioned configuration can be also be parsed as a ENV var. Use the prefix `NOREST_` and replace dots with underscores then:

```
env.NOREST_AUTH_COOKIENAME = "authorization"
```