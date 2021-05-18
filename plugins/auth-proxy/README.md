# Auth Proxy Plugin
A plugin that allows to add a authentication for Github to secure the noREST server and only allow changes
by people that have authorized Github. It adds three new endpoints:
1. GET /github/login -> used to login
2. GET /github/auth -> callback URL if successful a Cookie is set
3. GET /github/logout -> removes the cookie

## Install
Add it to your `norest.config.js` file:
``` 
const AuthProxyModule = require('@norest/plugin-auth-proxy').AuthProxyModule;

module.exports = {
  plugins: [AuthProxyModule.register({
    github: {
      client_id: '22e26fceea63a8ace68f',
      redirect_uri: 'http://localhost:3031/github/auth',
      client_secret: 'xyz',
    }
  })]
};
```
