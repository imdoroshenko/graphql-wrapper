const express = require('express')
const graphqlHTTP = require('express-graphql')
const { GraphQLSchema } = require('graphql')
const { Query } = require('./types')
const { wrapper } = require('../index')

const app = express()

app.use('/', graphqlHTTP({
  schema: wrapper(new GraphQLSchema({ query: Query }), [
    ['*.*', log]
  ]),
  graphiql: false
}))

app.listen(4000)

async function log (next, args, { type, field }) {
  const [,,, info] = args
  let path = info.path.key
  for (let current = info.path.prev; current; current = current.prev) {
    path = `${current.key}.${path}`
  }
  const startTs = Date.now()
  const value = await next()
  console.log(`Filed: "${type}.${field}"; path:"${path}"; execution time: ${Date.now() - startTs}ms`)
  return value
}
