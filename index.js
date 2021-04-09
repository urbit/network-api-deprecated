const { ApolloServer, gql }           = require('apollo-server')
const { GraphQLScalarType, Kind }     = require('graphql')
const dbResolvers                     = require('./db')
const apiResolvers                    = require('./api')

const typeDefs = gql`

  scalar Date

  enum StatusName {
    LOCKED
    UNLOCKED
    SPAWNED
    ACTIVATED
  }

  enum NodeType {
    GALAXY
    STAR
    PLANET
    # MOON
    # COMET
  }

  enum EventName {
    CHANGE_OWNERSHIP
    CHANGE_SPAWN_PROXY
    CHANGE_TRANSFER_PROXY
    CHANGE_MANAGEMENT_PROXY
    CHANGE_VOTING_PROXY
    ACTIVATE
    SPAWN
    ESCAPE_REQUESTED
    ESCAPE_CANCELLED
    ESCAPE_ACCEPTED
    LOST_SPONSOR
    BROKE_CONTINUITY
  }

  type NodeStatus {
    nodeStatusId: Int!
    statusName: StatusName!
  }
  
  type Node {
    urbitId: String

    sponsors: [String]
    # statusId: Int!
    kids: [String]
    nodeType: NodeType
    continuityNumber: Int
    revisionNumber: Int
    # numOwners: Int
    # ownershipProxy: String
    # spawnProxy: String
    # transferProxy: String
    # managementProxy: String
    # votingProxy: String
  }

  type Ping {
    pingId: Int!
    nodeId: String!
    online: Boolean!
    time: Date!
  }

  input PKIEventInput {
    urbitId: String
    since: Date
    nodeTypes: [NodeType]
    limit: Int
    offset: Int
  }

  input GetNodeInput {
    urbitId: String
  }

  type PKIEvent {
    eventId: Int!
    nodeId: String!
    eventTypeId: Int!
    sponsorId: String
    time: Date!
    address: String
    continuityNumber: Int
    revisionNumber: Int
  }

  type EventType {
    eventType: Int!
    eventName: EventName!
  }
  
  type Query {
    getNode(input: GetNodeInput): Node
    # getNodes: [Node]
    getPKIEvents(input: PKIEventInput): [PKIEvent]
    # The following will not actually be an array of strings. Need to discuss further
    # getActivity: [String]
  }

  type Mutation {
    populateRadar: Boolean
    populatePKIEvents: Boolean
    populatePing: Boolean
  }
`

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  parseValue(value) {
    return new Date(value) // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)) // Convert hard-coded AST string to integer and then to Date
    }
    return null
  },
})

// example query for getPKIEvents that works with its query variables
// mutation ($input: PKIEventInput) {
//   getPKIEvents(input: $input) {
      // eventId
      // nodeId
      // eventTypeId
      // sponsorId
      // time
      // address
      // continuityNumber
      // revisionNumber
//   }
// }

// sample query variables for getPKIEvents mutation:
// {
//   "input": {
//     "urbitId": "~ripten",
//     "since": "2021-03-24T16:40:32.000Z",
//     "nodeTypes": ["PLANET"],
//     "limit": 10,
//     "offset": 4
//   }
// }

const resolvers = {
  Date: dateScalar,
  Query: {...apiResolvers},
  Mutation: {...dbResolvers}
}

// console.log("🚀 ~ file: index.js ~ line 155 ~ apiResolvers", apiResolvers)
// const test = apiResolvers.getNode()
// console.log("🚀 ~ file: index.js ~ line 158 ~ test", test)

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
})