const { ApolloServer, gql } = require('apollo-server')
const { GraphQLScalarType, Kind } = require('graphql')

// const { startCron } = require('./src/cron')
const dbResolvers = require('./src/resolvers/db')
const apiResolvers = require('./src/resolvers/api')

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

  enum EventType {
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
    urbitId: String!
    numOwners: Int!
    sponsors: [Node]
    statusId: Int!
    kids: [String]
    nodeType: NodeType!
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
    type: EventType!
    sponsor: Node
    time: Date!
    address: String
    continuityNumber: Int
    revisionNumber: Int
  }

  type Activity {
    node: Node!
    date: Date!
    active: Boolean!
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
  parseValue (value) {
    return new Date(value) // Convert incoming integer to Date
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)) // Convert hard-coded AST string to integer and then to Date
    }
    return null
  }
})

const resolvers = {
  Date: dateScalar,
  Query: { ...apiResolvers },
  Mutation: { ...dbResolvers }
}

// startCron()

const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`))
