
const resolvers = require('./resolvers')
const database = require('./database')

const { GraphQLServer } = require('graphql-yoga')

const server = new GraphQLServer({ typeDefs: './src/typeDefs.graphql', resolvers, context: database })
const corsConfig = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}
server.start({ cors: corsConfig }, () => { console.log('Server is now running at localhost:4000') })
