/* eslint-disable @typescript-eslint/camelcase */
const HttpException = require('@nestjs/common').HttpException;
const HttpStatus = require('@nestjs/common').HttpStatus;
/*const AuthProxyModule = require('@norest/plugin-auth-proxy').AuthProxyModule;
const FakerModule = require('@norest/plugin-faker').FakerModule;*/
const HealthModule = require('@norest/plugin-health').HealthModule;

module.exports = {
  connector: {
    name: 'file',
    path: 'data',
    collection: req => {
      const match = req.url.match(new RegExp(/\/(nr-.*?)\//));
      if (match && match.length > 0) {
        const apiKey = match[1];

        if (apiKey) {
          return apiKey;
        }
      }

      throw new HttpException(
        'Please provide an API key.',
        HttpStatus.FORBIDDEN,
      );
    },
    createCollectionNotExisting: true,
  },
  websocket: {
    enabled: true,
  },
  auth: {
    enabled: false,
    cookieName: 'auth',
    userProperty: 'sub',
    jwt: {
      verify: true,
      secretOrPublicKey: 'topsecret',
      secretOrPrivateKey: 'topsecret',
    },
  },
  plugins: [
    /*AuthProxyModule.register({
      github: {
        client_id: '22e26fceea63a8ace68f',
        redirect_uri: 'http://localhost:3031/github/auth',
        client_secret: 'xyz',
      }
    }),
    FakerModule.register()*/
    HealthModule.register()
  ],
  path: '/api/:key/',
  fixed: false,
  port: 3030,
  cors: true,
};
