
# Pointsale
Pointsale is a lightweight local commerce software which is optimized to represent small and medium resellers with a shop. It is focus on representing the inventory and the reseller itself with an optional online selling ability. It tries to make representing the reseller and his products online as easy as possible.

## Features
Pointsale consist of four main parts:
 - Database: A mongo-db database
 - API: The backend api which allows to call for data via REST or websocket
 - Management UI: A user interface to manage your data
 - Shop UI: A default shop

The following is a feature list which is separated by theses parts:

### Database Features
 - one bucket called inventory
 - `ps_` fragments are automatically indexed

### API Features
 - `/inventory` endpoint: Contains all data with the possibility to set indexes by just prefixing `ps_`
  - `/inventory`: list all
  - `/inventory/{id}`: detail view
  - `/inventory?$skip=10&&$take=10&$orderby={fragment}`: list all, take 10, skip 10 and order it (only first level)
  - `/inventory/ws/{id}` Websocket channels based on id
  - `/inventory/ws` Websocket
  - Websocket and REST support fragment filtering: `$has=!ps_shop1 and ps_shop2`
  - `?$render={name}` -> renders the content based on the `ps_render` fragment.
 - GET always possible. Authentication only via oauth. 
 - Content of a `ps_` fragment is not accessibly un-auth.

### Management UI
 - Add a product `ps_product: {}`
 - Add a category `ps_category: {}` + tree
 - Manage options (e.g. opening times) `ps_options: {}`
 - Manage images `ps_image: {}`
 - upload a website (static content) -> alternative use renderers for that?!
 - manage articles (edit.js?!) `ps_content: {}`
 - Manage renderers `ps_renderers: {}`

### Shop UI
 - Static website 
 - Shop location
 - Product showcase
 - Book a appointment

 ## Tech stack:
  - API = mongoDB + nest.js
  - Management UI = Angular + Material
  - Shop UI = next.js + SSR

## Idea
The renderers are some sort of server less function which is executed on certain changes to the API. A renderer could look like:

```js
export const renderer = (data, log) => {
  const { image } = data.ps_image;
  if (image) {
    return data.image.toBase64Image();
  }
  log.warn('No image found for ' + data.id);
}
```

## noREST

### Index fragment
An index fragment is a simple fragment that gets indexed on the database. At the same time it allows to request that data via the route. E.g. all entities of an index fragment called `#_product: {}` can be requested via `{{url}}/product`. 

### Authentication
Authentication is not handled by the API itself. Instead noREST just have two states: 
 1. unauthenticated: If no JWT is set you can read all endpoints
 2. authenticated: If a JWT is set you can CRUD all endpoints.

 The API just takes any JWT passed as cookie or authentication header and uses the `sub` as the current user. There is no validation done on the JWT. The API expects that it is valid and therefore the stack needs to ensure that it is validated. This can be done via a middleware or an API gateway.

### Authorization with CRUDO
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

### Private payload
By default all endpoints are readable. Sometimes you want to make data private. Therefore you can simply add it to the index fragment. The data inside the index fragment is only exposed if the user is authenticated (JWT is set) and authorized (read or owner rights of crudo). The following data can be seen by an authorized user:

```JSON
"#_product": {
  "overpriced": true
}
```

### Json structure

`_`: representing meta data
`_{{key}}`: Data prefixed with a slash is not PATCH able.
`#_{{key}}: {}`: A indexed fragment, only readable by auth user
`@_{{key}}: []`: A reference to another document.

```json
 {
   "_": {
     "_created": "2312321",
     "_owner": "subname",
     "_touched": "2312321",
     "_touche": "username",
     "crudo": "r",
     "ttl": "112",
     "private": true
   },
   "#_product": {
     "saleable": true,
     "note": "Overpriced"
   },
   "name": "Foo product",
 }
```

```json
 {
   "_": {
     "_page": 1,
     "_total": 20
   },
   "data": [{
     "#_product": {
        "saleable": true,
        "note": "Overpriced"
      },
     "name": "Foo product",
   }]
 }
```

### Finalizing