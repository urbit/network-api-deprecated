const { gql }                     = require('apollo-server')
const apiResolvers                = require('./src/resolvers/api')
const { GraphQLScalarType, Kind } = require('graphql')

const typeDefs = gql`

  """
  A custom Date scalar must be defined in order to parse the PKI event log in a manner congenial to SQL, which is the database used in this project.
  """
  scalar Date

  """
  A Node may technically have more than one status.
  For example, UNLOCKED Nodes are also SPAWNED Nodes.
  However, since a particular status always implies the same additional statuses, the closest status in functionality to ONLINE will be used.
  """
  enum NodeStatus {
    LOCKED
    UNLOCKED
    SPAWNED
    ACTIVATED
    ONLINE
  }

  """
  Currently, there is no way to track MOONs' and COMETs' status on the network.
  This will likely change in the future, so they are left for now, commented-out.
  """
  enum NodeType {
    GALAXY
    STAR
    PLANET
    # MOON
    # COMET
  }

  """
  All PKI events should map to one of the following EventTypes.
  """
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
    """
    Query string for searching for Node[s]
    """
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
  
  """
  A Node is an Urbit ship.
  """
  type Node {
    urbitId: String!
    numOwners: Int!
    sponsors: [Node]
    status: NodeStatus!
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

  """
  A Ping represents a response from an Urbit ship as described by the Radar endpoint.
  """
  type Ping {
    pingId: Int!
    nodeId: String!
    online: Boolean!
    time: Date!
  }

  """
  A PKIEvent is an Urbit-network-defining event on the Ethereum blockchain.
  The collection of all PKIEvents allows a full reconstruction of the network's current state.
  """
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

  """
  The Activity type merely denotes whether a Node is online at a particular time, as described by Radar data.
  It does not describe any type of specific activity.
  """
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
  Query: { ...apiResolvers }
}

module.exports = { typeDefs, resolvers }