const { ApolloServer }        = require('apollo-server')
const { startCron }           = require('./src/cron')
const { typeDefs, resolvers } = require('./src/schema')

startCron()

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`))
