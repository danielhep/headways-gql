const resolvers = require('./resolvers')
const database = require('./database')

const { GraphQLServer } = require('graphql-yoga')

const server = new GraphQLServer({ typeDefs: './src/typeDefs.graphql', resolvers, context: database })

const port = process.env.PORT || 3000

const cors = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: true,
  optionsSuccessStatus: 204
}

server.start({ port, cors, options: { debug: true } }, () => { console.log(`Server is now running at http://localhost:${port}/`) })
