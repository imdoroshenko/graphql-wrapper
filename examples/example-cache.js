const express = require('express')
const graphqlHTTP = require('express-graphql')
const { GraphQLSchema } = require('graphql')
const { Query } = require('./types')
const { wrapper } = require('../index')
const crypto = require('crypto')

const app = express()

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


app.use('/', graphqlHTTP({
  schema: wrapper(new GraphQLSchema({query: Query}), [
    ['Album.photos', cache(TTL)]
  ]),
  graphiql: true
}))

app.listen(4000)

//
// {
//   albums {
//   title,
//     photos {
//     id
//     title
//     url
//   }
// }
// }
