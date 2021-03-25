const { ApolloServer, gql }   = require('apollo-server')
const dbResolvers             = require('./db')
const apiResolvers            = require('./api')

const typeDefs = gql`
  
  # Please completely ignore the commented out code below. It's just sandbox stuff to note for myself right now, will remove as needed later
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

  # Later set up scalar according to this process: https://www.apollographql.com/docs/apollo-server/schema/custom-scalars/
  # scalar Timestamp

  enum NodeType {
    GALAXY
    STAR
    PLANET
    # MOON
    # COMET
  }

  # These are what get passed into get-pki-events
  input PKIEventInput {
    urbitId: String
    # since: Timestamp
    since: String
    nodeTypes: [NodeType]
    # limit: Int!
    # offset: Int!
    limit: Int
    offset: Int
  }

  type PKIEvent {
    date: String
    point: String
    event: String
    field1: String
    field2: String
    field3: String
  }
  
  # Need to split into populatePKIEvents (call endpoint) and populatePKIEvents (send radar data from DB to UI). Currently populatePKIEvents is actually doing what populatePKIEvents will do
  type Query {
    populateRadar: Boolean
    populatePKIEvents: Boolean
    getPKIEvents(input: PKIEventInput): [PKIEvent]
    # getActivity: [String]
    # getNode: Node
  }
`

// example query for getPKIEvents that works with its query variables
// query ($input: PKIEventInput) {
//   getPKIEvents(input: $input) {
//     date
//     point
//     event
//     field1
//     field2
//     field3
//   }
// }

// query variables for query above:
// {
//   "input": {
//     "urbitId": "~ripten",
//     "since": "2021.3.25 12:20:20",
//     "nodeTypes": ["PLANET"],
//     "limit": 6,
//     "offset": 3
//   }
// }

const resolvers = {
  Query: {...dbResolvers, ...apiResolvers}
}

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
})