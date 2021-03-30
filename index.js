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

  # Will need to change the date to a custom defined scalar called Date
  # Want date output like this: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  # Format similar to: 2011-10-05T14:48:00.000Z
  # WIll need to return according to the spec data structure regarding field 1-3
  # This will involve determining the content of the fields
  # See if the postgres client handles injection attacks
  # Will need to handle converting from events.txt fields to pki_event as defined in the spec at the database layer, not the GraphQL layer, because GraphQL is much slower at scale
  # It is an unknown whether the list of PKI events is sufficient to populate get-node. If so, get-node can just be a materialized view
  type PKIEvent {
    date: String
    point: String
    event: String
    field1: String
    field2: String
    field3: String
  }
  
  # Need to split into populatePKIEvents (call endpoint) and populatePKIEvents (send radar data from DB to UI). Currently populatePKIEvents is actually doing what populatePKIEvents will do
  # populateRadar and populatePKIEvents should be mutations instead of queries
  # should be a mutation instead of a query if there are any side effects at all
  type Query {
    populateRadar: Boolean
    populatePKIEvents: Boolean
    getPKIEvents(input: PKIEventInput): [PKIEvent]
    # getActivity: [String]
    # getNode: Node
  }
`
// https://node-postgres.com/features/queries#parameterized-query
// Do the above

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