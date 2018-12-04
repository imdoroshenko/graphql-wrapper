const express = require('express')
const graphqlHTTP = require('express-graphql')
const { GraphQLSchema } = require('graphql')
const { Query } = require('./types')
const { wrapper, metricsMiddleware, express: { chartMiddleware } } = require('../index')

const schema = wrapper(new GraphQLSchema({ query: Query }), [
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
