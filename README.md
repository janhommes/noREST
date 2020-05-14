
<p align="center">
  <img src="documentation/assets/logo.png">
  <br />
  <strong>A zeroconfig (not only) RESTfull API</strong>
</p>

# Getting started

Download the CLI via npm:
```
npm i -g @norest/cli
```

And start it by running the command
```
norest
```

The default port is `3030` and the base path is `api`. You can start by POSTing an fragment to that endpoint:
```
POST
{
  "#_product": {}
  "price": 10,
  "name": "foo"
}
```

That product is then accessible via the endpoint `http://localhost:3030/api/product`.


# Concept
Following the core concepts of the noREST API that allow the simplified data structure. 

## Index fragment `#`
An index fragment is a simple fragment that gets indexed on the database. At the same time it allows to request that data via the route. E.g. all entities of an index fragment called `#_product: {}` can be requested via `{{url}}/product`. 

## References `@`
todo! 

## Authentication
Authentication is not handled by the API itself. Instead noREST just have two states: 
 1. unauthenticated: If no JWT is set you can read all endpoints
 2. authenticated: If a JWT is set you can CRUD all endpoints.

 The API just takes any JWT passed as cookie or authentication header and uses the `sub` as the current user. There is no validation done on the JWT. The API expects that it is valid and therefore the stack needs to ensure that it is validated. This can be done via a middleware or an API gateway.

## Authorization with CRUDO (todo)
To give certain users certain access to certain endpoints a `crudo` entry can be added to the JWT. The term `crudo` stands for **c**reate, **r**ead, **u**pdate, **d**elete and **o**wn. "Own" is a special kind which allows full access to entries you are owning. An example `crudo` entry looks the following:

```json
{
  "sub": "foo",
  "crudo": {
    "user": "o",
    "order": "cru",
  } 
}
```

Note:
 - By default any authenticated user has CRUD rights to all endpoints and you must opt-out to revoke the rights. So if there is another endpoint called products, the user foo is allow to create, read, update and delete items on this endpoint. It is a good stategy to change that strategy in the finalizing step of the API.
 - Read in this case allows to read even the private payload of a response (shown in the next).

## Private payload
By default all endpoints are readable. Sometimes you want to make data private. Therefore you can simply add it to the index fragment. The data inside the index fragment is only exposed if the user is authenticated (JWT is set) and authorized (read or owner rights of crudo). The following data can be seen by an authorized user:

```JSON
"#_product": {
  "overpriced": true
}
```