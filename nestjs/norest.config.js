const HttpException = require('@nestjs/common').HttpException;
const HttpStatus = require('@nestjs/common').HttpStatus;

module.exports = {
  connector: {
    name: 'file',
    path: 'data',
    collection: req => {
      const match = req.url.match(new RegExp(/api\/(nr-.*?)\//));
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
    cookieName: 'auth',
    userProperty: 'sub',
  },
  path: 'api/:key/',
  fixed: false,
};
