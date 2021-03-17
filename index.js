const { ApolloServer, gql }   = require('apollo-server')
const dbResolvers             = require('./db')
// const apiResolvers            = require('./api')

const typeDefs = gql`
  
  # Which of the following values do we want to be required?
  # type Node {
  #   urbit_id: String!
  #   node_type: String!
  #   # Use radar to get status?
  #   status: String!
  #   continuity: Int
  #   key_revision: Int
  #   num_owners: Int
  #   sponsors: [Node]
  #   # We def want to call it kids, as that is what it's called in Arvo. There just seems to be some inconsistency with, for example, azimuth-js.
  #   kids: [Node]
  #   proxy_addresses: [String]
  # }

  # scalar Timestamp

  # enum NodeType {
  #   GALAXY
  #   STAR
    # PLANET
    # MOON
    # COMET
  # }

  # type PKIEvent {
  #   urbit_id: String
  #   # since: Timestamp
  #   since: String
  #   node_types: [NodeType]
  #   limit: Int!
  #   offset: Int!
  # }

  # type PKIEvent {
  #   date: String
  #   point: String
  #   event: String
  #   field1: String
  #   field2: String
  #   field3: String
  # }
  
  type Query {
    # getDB: String
    # populateRadar: String
    # populateAzimuth: String
    # getNode: String
    # getNodes: [String]
    # getPKIEvents: [PKIEvent]
    getPKIEvents: Boolean
    # getActivity: [String]
    # getNode: Node
  }
`

// In radar, what does a key with a value of an empty array mean? Does that mean it is spawned but not online? Or that it is unspawned?

// What precisely do we want to store in the database? Because it doesn't make sense to store some things in there that can easily be accessed by a call to Azimuth, as this would result in degraded performance


// Text file representing a stream of all of the pki events up to present time (seems to be real-time): https://azimuth.network/stats/events.txt

// const resolvers = {
//   Query: {...dbResolvers, ...apiResolvers}
// }

const resolvers = {
  Query: {...dbResolvers}
}

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
})