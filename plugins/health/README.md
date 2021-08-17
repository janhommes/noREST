### Health plugin
A very simple plugin which adds a 200 on the `/health` endpoint for readiness- or liveness-probe.

## Install
Add it to your `norest.config.js` file:
``` 
const HealthModule = require('@norest/plugin-health').HealthModule;

module.exports = {
  plugins: [HealthModule.register()]
};
```

## Usage
`GET /health` -> 200 Status okay if instance is up and running.

