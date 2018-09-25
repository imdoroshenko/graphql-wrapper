const express = require('express')
const graphqlHTTP = require('express-graphql')
const { GraphQLSchema } = require('graphql')
const { Query } = require('./types')
const { wrapper } = require('../index')

const app = express()

async function log(next, args) {
  const [,,, info] = args
  let path = info.path.key
  for(let current = info.path.prev; current; current = current.prev) {
    path = `${current.key}.${path}`
  }
  const startTs = Date.now()
  const value = await next()
  console.log(`"${path}" execution time: ${Date.now() - startTs}ms`)
  return value
}

app.use('/', graphqlHTTP({
  schema: wrapper(new GraphQLSchema({query: Query}), [
    ['*.*', log]
  ]),
  graphiql: true
}))

app.listen(4000)
