# GraphQL middleware
-------
This is a small library that makes it possible to apply middleware for your resolvers using specific rules. It can be used for logging, collecting metrics, to cache, to modify the parameters or response, for authorization and access control.

It's built to be used with express-graphql but it can also be used with any other library, as well as stand-alone.

## Installation

```shell
npm i graphql-wrapper --save
```

## Basic usage
```javascript
// ...
const { allowOnly, cache, logs, csrfValidation } = require('./my-middleware')
const { wrapper } = require('graphql-types-middleware')
/**
* 
* @param {Function} next original resolve function
* @param {object[]} args original resolve arguments (https://graphql.org/learn/execution/#root-fields-resolvers)
* @param {object} args[0] (obj) The previous object, which for a field on the root Query type is often not used.
* @param {object} args[1] (args) The arguments provided to the field in the GraphQL query.
* @param {object} args[2] (context) A value which is provided to every resolver and holds important contextual information like the currently logged in user, or access to a database.
* @param {object} args[3] (info) A value which holds field-specific information relevant to the current query as well as the schema details, also refer type GraphQLResolveInfo for more details. (https://graphql.org/graphql-js/type/#graphqlobjecttype)
* @param {object} info Additional information about current resolve
* @param {object} info.field Field name
* @param {object} info.type Type name
* @return [any]
*/
function myMiddleware(next, args, info) {
  console.log(`myMiddleware: ${info.type}.${info.field}`)
  return next(args) // it is not required to pass arguments to next(),     
}                   // if there are no arguments passed, original args will be used

const app = express()

app.use('/', graphqlHTTP({
  schema: wrapper(new GraphQLSchema({query: Query}), [
    // middleware will me executed in order: from left to right, from top to bottom
    ['Query.users', myMiddleware], // you can specify middleware to any field in your schema
    ['Mutation.users', myMiddleware, allowOnly('admin')], // multiple middleware can be assigned
    ['User.address', cache({ttl: 50})], // You can assign middleware not only to Query or Mutation types
    ['Mutation.*', csrfValidation], // It is possible to use wildcard  but in this case middleware will be assigned   
                                    // only to fields that already have resolvers
    ['!*.*', logs], // by using "!" symbol at the beginning of the rule name, you can force wrapper to create
                    // middleware for the fields that did not have resolvers initially                               
  ]),
  graphiql: true
}))

app.listen(4000)
``` 
## Contribution

If you found this library useful, please feel free to contribute or make a feature request.

## Examples

You can find all examples in [/examples](/examples) folder

To launch example, you need to execute the following command:

```shell
node ./examples/example-<name>.js
```

It will launch test graphql-express server at port 4000 with enabled graphiql playground.
Check "Docs" sidebar to see all available fields.

- [Logging example](#logging-example)
- [Profiling example](#profiling-example)
- [Access control example](#access-control-example)
- [Logging example](#cache-example)

### Logging example 
[/examples/example-logs.js](/examples/example-logs.js)

This example shows how you can add logging to your resolvers without modifying them directly
  
```javascript
async function log (next, args, { type, field }) {
  const [,,, info] = args
  let path = info.path.key
  for(let current = info.path.prev; current; current = current.prev) {
    path = `${current.key}.${path}`
  }
  const startTs = Date.now()
  const value = await next()
  console.log(`Filed: "${type}.${field}"; path:"${path}"; execution time: ${Date.now() - startTs}ms`)
  return value
}

app.use('/', graphqlHTTP({
  schema: wrapper(new GraphQLSchema({ query: Query }), [
    ['*.*', log]
  ]),
  graphiql: false
}))

app.listen(4000)

```

Query:
```GraphQL
{
  posts {
    id
  }
  todos {
    id
  }
	user(id: 1) {
    albums {
      id
      photos {
        id
      }
    }
  }
}
```

Command line output:
```shell
Filed: "Query.user"; path:"user"; execution time: 101ms
Filed: "User.albums"; path:"user.albums"; execution time: 71ms
Filed: "Query.todos"; path:"todos"; execution time: 195ms
Filed: "Query.posts"; path:"posts"; execution time: 239ms
Filed: "Album.photos"; path:"user.albums.2.photos"; execution time: 42ms
Filed: "Album.photos"; path:"user.albums.0.photos"; execution time: 45ms
Filed: "Album.photos"; path:"user.albums.1.photos"; execution time: 45ms
Filed: "Album.photos"; path:"user.albums.3.photos"; execution time: 44ms
Filed: "Album.photos"; path:"user.albums.7.photos"; execution time: 44ms
Filed: "Album.photos"; path:"user.albums.4.photos"; execution time: 48ms
Filed: "Album.photos"; path:"user.albums.9.photos"; execution time: 44ms
Filed: "Album.photos"; path:"user.albums.5.photos"; execution time: 50ms
Filed: "Album.photos"; path:"user.albums.8.photos"; execution time: 49ms
Filed: "Album.photos"; path:"user.albums.6.photos"; execution time: 53ms
```

### Profiling example
[/examples/example-profiling.js](/examples/example-profiling.js)

Example of how you can profile execution of GraphQL request.
This middleware will print chart that describes order, execution time, and sequence of every resolver that was involved
in particular request. It also shows which requests were resolved concurrently and which ones — sequentially. 
 
```javascript
const { wrapper, metricsMiddleware, express: { chartMiddleware } } = require('../index')

const schema = wrapper(new GraphQLSchema({query: Query}), [
  ['*.*', metricsMiddleware]
])

const app = express()

app.use(chartMiddleware({ barWidth: 50 }))
app.use('/', graphqlHTTP((req, res) => ({
  context: res.locals,
  schema,
  graphiql: true
})))

app.listen(4000)
```
Query:
```GraphQL
{
  posts {
    id
  }
  todos {
    id
  }
	user(id: 1) {
    albums {
      id
      photos {
        id
      }
    }
  }
}

```
Command line output:

```shell
posts                  [-----------------                                 ]ts: 76ms
todos                  [----------------                                  ]ts: 50ms
user                   [---------------                                   ]ts: 44ms
 └user.albums          [               -------------------                ]ts: 57ms
  ├user.albums.0.photos[                                  ----------------]ts: 52ms
  ├user.albums.1.photos[                                  --------------- ]ts: 45ms
  ├user.albums.2.photos[                                   ---------      ]ts: 30ms
  ├user.albums.3.photos[                                   --------       ]ts: 26ms
  ├user.albums.4.photos[                                   ----------     ]ts: 30ms
  ├user.albums.5.photos[                                    -----------   ]ts: 34ms
  ├user.albums.7.photos[                                    ----------    ]ts: 30ms
  ├user.albums.6.photos[                                    -----------   ]ts: 35ms
  ├user.albums.8.photos[                                    ------------- ]ts: 38ms
  └user.albums.9.photos[                                     -------------]ts: 41ms

 Total execution time: 154ms
```
### Access control example
[/examples/example-hide-fields.js](/examples/example-hide-fields.js)

This example shows how you can control access to specific fields in your GraphQL schema 

```javascript
const MY_USER_ID = 1
const IS_ADMIN = false

// hide field based on arguments
function hideNotMyAddress(next, args) {
  const [{id}] = args
  return id === MY_USER_ID ? next(args) : null
}

// hide field based on app inner state
function onlyAdmins(next, args) {
  return IS_ADMIN? next(args) : null
}

const app = express()

app.use('/', graphqlHTTP({
  schema: wrapper(new GraphQLSchema({query: Query}), [
    ['User.address', hideNotMyAddress],
    ['Query.albums', onlyAdmins]
  ]),
  graphiql: true
}))

app.listen(4000)
```
Query:
```GraphQL
{
  me: user(id: 1) {
    id
    username
    address {
      city
      zipcode
    }
  }
  otherUser: user(id: 2) {
    id
    username
    address {
      city
      zipcode
    }
  }
  otherUserPost: post(id: 20) {
    id
    title
    user {
      id
      username
      address {
        city
      zipcode
      }
    }
  }
  albums {
    id
    title
  }
}

```
Here you can see that `address` field is hidden from all users who are not "me". 
You can also see that `albums` field is restricted
```json
{
  "data": {
    "me": {
      "id": 1,
      "username": "Bret",
      "address": {
        "city": "Gwenborough",
        "zipcode": "92998-3874"
      }
    },
    "otherUser": {
      "id": 2,
      "username": "Antonette",
      "address": null
    },
    "otherUserPost": {
      "id": 20,
      "title": "doloribus ad provident suscipit at",
      "user": {
        "id": 2,
        "username": "Antonette",
        "address": null
      }
    },
    "albums": null
  }
}
```

### Cache example
[/examples/example-cache.js](/examples/example-cache.js)

Basic example of how you can add cache for specific fields. In this example I have added cache middleware
for `Album.photos` field.

```javascript
const TTL = 5000
const app = express()

app.use('/', graphqlHTTP({
  schema: wrapper(new GraphQLSchema({query: Query}), [
    ['Album.photos', cache(TTL)]
  ]),
  graphiql: true
}))

app.listen(4000)

/*
functions below created with sole purpose of the demo, do not use them in actual applications
 */

function makeHash(string) {
  const hash = crypto.createHash('sha256')
  hash.update(string)
  return hash.digest('hex')
}

function cache(ttl) {
  const dictionary = new Map()
  return async (next, [,args]) => {
    const hash = makeHash(JSON.stringify(args))
    const ts = Date.now()
    if (dictionary.has(hash) && ts - dictionary.get(hash).ts < ttl) {
      return dictionary.get(hash).value
    }
    const value = await next()
    dictionary.set(hash, { ts, value })
    return value
  }
}
```

```GraphQL
{
  user(id: 1) {
    name
    albums {
      title
      photos {
        id
      }
    }
  }
}
```

I will use profiling tool from previous examples to show the difference between non-cached and cached request.

non-cached request
```shell
user                   [--------------                                    ]ts: 23ms
 └user.albums          [              ---------                           ]ts: 15ms
  ├user.albums.0.photos[                       -----------------          ]ts: 28ms
  ├user.albums.1.photos[                        ------------------        ]ts: 30ms
  ├user.albums.2.photos[                         ------------------       ]ts: 31ms
  ├user.albums.3.photos[                         -------------------------]ts: 41ms
  ├user.albums.5.photos[                          ------------------      ]ts: 31ms
  ├user.albums.4.photos[                          ---------------------   ]ts: 35ms
  ├user.albums.6.photos[                          -------------------     ]ts: 31ms
  ├user.albums.7.photos[                           -------------------    ]ts: 31ms
  ├user.albums.9.photos[                            ----------------------]ts: 37ms
  └user.albums.8.photos[                            ----------------------]ts: 38ms

 Total execution time: 83ms
```

cached request
```shell
user                   [--------------------------                        ]ts: 17ms
 └user.albums          [                          ------------------------]ts: 16ms
  ├user.albums.0.photos[                                                  ]ts: 0ms
  ├user.albums.1.photos[                                                  ]ts: 0ms
  ├user.albums.2.photos[                                                  ]ts: 0ms
  ├user.albums.3.photos[                                                  ]ts: 0ms
  ├user.albums.4.photos[                                                  ]ts: 0ms
  ├user.albums.5.photos[                                                  ]ts: 0ms
  ├user.albums.6.photos[                                                  ]ts: 0ms
  ├user.albums.7.photos[                                                  ]ts: 0ms
  ├user.albums.8.photos[                                                  ]ts: 0ms
  └user.albums.9.photos[                                                  ]ts: 0ms

 Total execution time: 33ms
```

## Todo
- Tests
- Better documentation
