const HttpException = require('@nestjs/common').HttpException;
const HttpStatus = require('@nestjs/common').HttpStatus;
const AuthService2 = require('@norest/plugin-auth-proxy').AuthService2;
const AuthService = require('@norest/nestjs').AuthService;

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
  },
  plugins: {
    providers: [
      AuthService2,
      { provide: AuthService, useExisting: AuthService2 },
    ],
  },
  path: '/:key/',
  fixed: false,
  port: 3031,
  cors: true,
};
