module.exports = {
  connector: {
    name: 'mongodb',
    url: 'mongodb://127.0.0.1:27017/test',
    collection: (req) => {
      if (req) {
        console.log(req.headers);
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

/*
module.exports = {
  connector: {
    name: 'file',
    path: '../../data',
    collection: (req) => {
      if (req && req.headers['x-demo-key']) {
        console.log(req.headers);
      }
      return 'sample';
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
 */