const express = require('express')
const graphqlHTTP = require('express-graphql')
const { GraphQLSchema } = require('graphql')
const { Query } = require('./types')
const { wrapper } = require('../index')
const { metricsMiddleware } = require('../lib/metrics')
const { printChart } = require('../lib/chart')

const app = express()

const schema = wrapper(new GraphQLSchema({query: Query}), [
  ['*.*', metricsMiddleware]
])

app.use((req, res, next) => {
  const originalSend = res.send
  res.send = function() {
    console.log(printChart(res.locals.__metrics))
    return originalSend.apply(res, arguments)
  }
  next()
})

app.use('/', graphqlHTTP((req, res) => ({
  context: res.locals,
  schema,
  graphiql: true
})))


app.listen(4000)
