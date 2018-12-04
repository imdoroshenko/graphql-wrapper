const express = require('express')
const graphqlHTTP = require('express-graphql')
const { GraphQLSchema } = require('graphql')
const { Query } = require('./types')
const { wrapper, metricsMiddleware, express: { chartMiddleware } } = require('../index')
const crypto = require('crypto')

const TTL = 5000
const app = express()

const schema = wrapper(new GraphQLSchema({ query: Query }), [
  ['*.*', metricsMiddleware],
  ['Album.photos', cache(TTL)]
])

app.use(chartMiddleware({ barWidth: 50 }))
app.use('/', graphqlHTTP((req, res) => ({
  context: res.locals,
  schema,
  graphiql: true
})))

app.listen(4000)

/*
functions below created with sole purpose of the demo, do not use them in actual applications
 */

function makeHash (string) {
  const hash = crypto.createHash('sha256')
  hash.update(string)
  return hash.digest('hex')
}

function cache (ttl) {
  const dictionary = new Map()
  return async (next, [, args]) => {
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
