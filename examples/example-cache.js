const express = require('express')
const graphqlHTTP = require('express-graphql')
const { GraphQLSchema } = require('graphql')
const { Query } = require('./types')
const { wrapper } = require('../index')
const crypto = require('crypto')

const { metricsMiddleware } = require('../lib/metrics')
const { printChart } = require('../lib/chart')

const app = express()


app.use((req, res, next) => {
  const originalSend = res.send
  res.send = function() {
    console.log(printChart(res.locals.__metrics))
    return originalSend.apply(res, arguments)
  }
  next()
})

function makeHash(string) {
  const hash = crypto.createHash('sha256')
  hash.update(string)
  return hash.digest('hex')
}

const TTL = 5000

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

const schema = wrapper(new GraphQLSchema({query: Query}), [
  ['*.*', metricsMiddleware],
  ['Album.photos', cache(TTL)]
])

app.use('/', graphqlHTTP((req, res) => ({
  context: res.locals,
  schema,
  graphiql: true
})))

app.listen(4000)


