const HttpException = require('@nestjs/common').HttpException;
const HttpStatus = require('@nestjs/common').HttpStatus;
const URL = require('url').URL;

module.exports = {
  connector: {
    name: 'mock',
    path: 'data',
    // url: 'mongodb://127.0.0.1:27017/test',
    collection: req => {
      const apiKey = new URL(req.url).searchParams.get('apiKey');
      if (apiKey) {
        return apiKey;
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
  path: 'api',
  fixed: false,
};
