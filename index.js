const { ApolloServer, gql }           = require('apollo-server')
const { GraphQLScalarType, Kind }     = require('graphql')
const cron                            = require('node-cron')
const { request }                     = require('graphql-request')
const dbResolvers                     = require('./src/resolvers/db/index')
const apiResolvers                    = require('./src/resolvers/api/index')

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

  input GetNodeInput {
    urbitId: String
  }

  input GetNodesInput {
    q: String
    nodeTypes: [NodeType]
    limit: Int
    offset: Int
  }

  input PKIEventInput {
    urbitId: String
    since: Date
    nodeTypes: [NodeType]
    limit: Int
    offset: Int
  }

  input GetActivityInput {
    urbitId: String
    since: Date
    until: Date
  }

  type NodeStatus {
    nodeStatusId: Int!
    statusName: StatusName!
  }
  
  type Node {
    urbitId: String
    numOwners: Int
    sponsors: [String]
    statusId: Int!
    kids: [String]
    nodeType: NodeType
    continuityNumber: Int
    revisionNumber: Int
    ownershipProxy: String
    spawnProxy: String
    transferProxy: String
    managementProxy: String
    votingProxy: String
  }

  type Ping {
    pingId: Int!
    nodeId: String!
    online: Boolean!
    time: Date!
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

  type Activity {
    urbitId: String
    date: Date
    active: Boolean
  }
  
  type Query {
    getNode(input: GetNodeInput): Node
    getNodes(input: GetNodesInput): [Node]
    getPKIEvents(input: PKIEventInput): [PKIEvent]
    getActivity(input: GetActivityInput): [Activity]
  }

  type Mutation {
    populateRadar: Boolean
    populatePKIEvents: Boolean
    populateRawEvents: Boolean
    populatePing: Boolean
    populateNodeStatus: Boolean
    populateEventType: Boolean
    populateNodeType: Boolean
    populateAll: Boolean
    populateDailyCron: Boolean
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
    // "urbitId": "~ripten",
    // "since": "2021-03-24T16:40:32.000Z",
    // "nodeTypes": ["PLANET"],
    // "limit": 10,
    // "offset": 4
//   }
// }

// {
//   "input": {
//     "urbitId": "~ripten",
//     "since": "2021-04-10 21:08:37.053",
//     "until": "2021-04-01 21:08:37.053"
//   }
// }

const resolvers = {
  Date: dateScalar,
  Query: {...apiResolvers},
  Mutation: {...dbResolvers}
}

const query = `
  mutation {
    populateDailyCron
  }
`

// Below is every minute for testing
const cronExpression = '* * * * *'

// Below is every five minutes for testing
// const cronExpression = '*/5 * * * *'

// Below is every 24 hours at midnight for production
// const cronExpression = '0 0 * * *'

cron.schedule(cronExpression, () => request('http://localhost:4000', query))

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`))