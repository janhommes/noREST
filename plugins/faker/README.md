### Faker plugin
A plugin to generate fake data.

## Install
Add it to your `norest.config.js` file:
``` 
const FakerModule = require('@norest/plugin-faker').FakerModule;

module.exports = {
  plugins: [FakerModule.register()]
};
```

## Usage
`POST` a [FakeDefinition](fake-definition.class.ts) to the `/faker/fake` endpoint:

```
POST http://localhost:3030/faker/fake
{
	"collection": "nr-fake-test",
  "namespace": "hacker",
  "amount": 20
}
``` 

To add more fake data, `PUT` to `/faker/fake` endpoint:

```
PUT http://localhost:3030/faker/fake
{
	"collection": "nr-fake-test",
  "namespace": "animal",
  "amount": 10
}
```

As namespaces can be used any of the [faker.js](https://github.com/marak/Faker.js/) API methods.
