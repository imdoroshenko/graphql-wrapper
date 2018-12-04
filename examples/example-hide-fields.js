const express = require('express')
const graphqlHTTP = require('express-graphql')
const { GraphQLSchema } = require('graphql')
const { Query } = require('./types')
const { wrapper } = require('../index')

const app = express()

app.use('/', graphqlHTTP({
  schema: wrapper(new GraphQLSchema({ query: Query }), [
    ['User.address', hideNotMyAddress],
    ['Query.albums', onlyAdmins]
  ]),
  graphiql: true
}))

app.listen(4000)

const MY_USER_ID = 1
const IS_ADMIN = false

// hide field based on arguments
function hideNotMyAddress (next, args) {
  const [{ id }] = args
  return id === MY_USER_ID ? next(args) : null
}

// hide field based on app inner state
function onlyAdmins (next, args) {
  return IS_ADMIN ? next(args) : null
}

