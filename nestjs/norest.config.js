const HttpException = require('@nestjs/common').HttpException;
const HttpStatus = require('@nestjs/common').HttpStatus;
const AuthProxyModule = require('@norest/plugin-auth-proxy').AuthProxyModule;

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
  plugins: [AuthProxyModule.register()],
  path: '/:key/',
  fixed: false,
  port: 3030,
  cors: true,
};
