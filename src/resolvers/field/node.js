const format = require('pg-format')
const _get = require('lodash.get')

const { query } = require('../../utils')

const node = async (_, { input: { urbitId } }) => {
  
  // type Node {
  //   urbitId: String!
  //   numOwners: Int!
  //   sponsors: [Node]
  //   status: NodeStatus!
  //   kids: [String]
  //   nodeType: NodeType!
  //   continuityNumber: Int
  //   revisionNumber: Int
  //   ownershipProxy: String
  //   spawnProxy: String
  //   transferProxy: String
  //   managementProxy: String
  //   votingProxy: String
  // }

  // so would need to return something like this
  // (with different values in different members of the array obviously)

  // [
  //   { 
  //     urbitId: '~littel-wolfur', 
  //     numOwners: 1, 
  //     sponsors: ?,
  //     status: 'LOCKED',
  //     kids: ?,
  //     nodeType: 'PLANET',
  //     continuityNumber: 1,
  //     revisionNumber: 1,
  //     ownershipProxy: "anEthAddress",
  //     spawnProxy: "anEthAddress",
  //     transferProxy: "anEthAddress",
  //     managementProxy: "anEthAddress",
  //     votingProxy: "anEthAddress"
  //   },
  //   { 
  //     urbitId: '~littel-wolfur', 
  //     numOwners: 1, 
  //     sponsors: ?,
  //     status: 'LOCKED',
  //     kids: ?,
  //     nodeType: 'PLANET',
  //     continuityNumber: 1,
  //     revisionNumber: 1,
  //     ownershipProxy: "anEthAddress",
  //     spawnProxy: "anEthAddress",
  //     transferProxy: "anEthAddress",
  //     managementProxy: "anEthAddress",
  //     votingProxy: "anEthAddress"
  //   }
  // ]
}

module.exports = { node }
