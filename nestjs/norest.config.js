module.exports = {
  connector: {
    name: 'mongodb',
    url: 'mongodb://127.0.0.1:27017/test',
    collection: (req) => {
      if (req) {
        return req.headers['x-norest-demo-key'];
      }
      return 'delete_me2';
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
