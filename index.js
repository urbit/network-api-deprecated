const { ApolloServer, gql }   = require('apollo-server')
const dbResolvers             = require('./db')
const apiResolvers            = require('./api')

const typeDefs = gql`
  type Query {
    getDB: String
    getNode: String
    getNodes: [String]
    getPKIEvents: [String]
    getActivity: [String]
  }
`

const resolvers = {
  Query: {...dbResolvers, ...apiResolvers}
}

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
})