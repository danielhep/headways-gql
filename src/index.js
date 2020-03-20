const { sentry } = require('graphql-middleware-sentry')

const resolvers = require('./resolvers')
const database = require('./database')

const { GraphQLServer } = require('graphql-yoga')

const sentryMiddleware = sentry({
  config: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV
  },
  withScope: (scope, error, context) => {
    scope.setExtra('body', context.request.body)
    scope.setExtra('origin', context.request.headers.origin)
    scope.setExtra('user-agent', context.request.headers['user-agent'])
  }
})

const server = new GraphQLServer({ typeDefs: './src/typeDefs.graphql', resolvers, context: database, middlewares: [sentryMiddleware] })

const port = process.env.port || 3000

const cors = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: true,
  optionsSuccessStatus: 204
}

server.start({ port, cors, options: { debug: true } }, () => { console.log(`Server is now running at http://localhost:${port}/`) })
