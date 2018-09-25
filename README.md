#GraphQL middleware
-------
This is a small library gives ability to apply middleware for your resolvers by using specific rules. It can be use for logging, collecting metrics, to cache, to modify the parameters or response, to authorisation and access control.

It's build to be used with express-graphql but it can be used with 

##Usage
```shell
npm i graphql-types-middleware --save
```

##Basic example
```js
// ...
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
  return next(args) // it is not required to pass arguments to the next(),     
}                   // if no arguments passed original args will be used

const app = express()

app.use('/', graphqlHTTP({
  schema: wrapper(new GraphQLSchema({query: Query}), [
    ['Query.users', myMiddleware],
    ['Mutation.users', myMiddleware]
  ]),
  graphiql: true
}))

app.listen(4000)

``` 

##Logging example
