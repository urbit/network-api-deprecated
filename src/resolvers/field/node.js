const format = require('pg-format')
const _get = require('lodash.get')

const { query, getNodeStatus } = require('../../utils')

const node = {
  // console.log('running node')
  // type Node {
  //   urbitId: String!
  //   numOwners: Int!
  //   sponsor: [Node]
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
  //     sponsor: ?,
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
      // numOwners: 1, 
      // sponsor: ?,
      // status: 'LOCKED',
      // kids: ?,
      // nodeType: 'PLANET',
      // continuityNumber: 1,
      // revisionNumber: 1,
      // ownershipProxy: "anEthAddress",
      // spawnProxy: "anEthAddress",
      // transferProxy: "anEthAddress",
      // managementProxy: "anEthAddress",
      // votingProxy: "anEthAddress"
  //   }
  // ]

  urbitId: input => {
    const { urbitId } = input
    console.log("🚀 ~ file: node.js ~ line 62 ~ input", input)
    console.log('running node.urbitId')
    console.log("🚀 ~ file: node.js ~ line 62 ~ urbitId: ~ urbitId", urbitId)
    return urbitId
  },
  numOwners: async input => {
    const { urbitId } = input
    console.log('running node.numOwners')
    const getNumOwnersQuery = `select count(*) from pki_events where node_id = '${urbitId}' and event_type_id = 1;`
    const getNumOwnersResponse = await query(getNumOwnersQuery)
    const numOwners = parseInt(_get(getNumOwnersResponse, 'rows[0].count')) || 1
    return numOwners
  }, 
  sponsor: async input => {
    const { urbitId } = input
    console.log('running node.sponsor')
    const getSponsorQuery = `select sponsor_id from pki_events where node_id = '${urbitId}' order by time desc limit 1;`
    const getSponsorResponse = await query(getSponsorQuery)
    const getSponsorResponseRow = _get(getSponsorResponse, 'rows[0]') || []
    
    const sponsor = getSponsorResponseRow ? _get(getSponsorResponseRow, 'sponsor_id') || null : null
    return sponsor
  },
  status: async input => {
    const { urbitId } = input
    console.log('running node.status')
    const status = await getNodeStatus(urbitId)
    return status
  },
  kids: async input => {
    const { urbitId } = input
    console.log('running node.kids')
    const getKidsQuery = `select distinct node_id from pki_events where sponsor_id = '${urbitId}';`
    const getKidsResponse = await query(getKidsQuery)
    const getKidsResponseRows = _get(getKidsResponse, 'rows') || []
    const kids = getKidsResponseRows.map(row => row.node_id)
    return kids
  },
  nodeType: async input => {
    console.log('running node.nodeType')
    return 'PLANET'
  },
  continuityNumber: async input => {
    const { urbitId } = input
    console.log('running node.continuityNumber')
    const getContinuityNumberQuery = `select continuity_number from pki_events where node_id = '${urbitId}' order by time desc limit 1;`
    const getContinuityNumberResponse = await query(getContinuityNumberQuery)
    const getContinuityNumberResponseRow = _get(getContinuityNumberResponse, 'rows[0]') || []
    const continuityNumber = getContinuityNumberResponseRow ? _get(getContinuityNumberResponseRow, 'continuity_number') || null : null
    return continuityNumber
  },
  revisionNumber: async input => {
    const { urbitId } = input
    console.log('running node.revisionNumber')
    const getRevisionNumberQuery = `select revision_number from pki_events where node_id = '${urbitId}' order by time desc limit 1;`
    const getRevisionNumberResponse = await query(getRevisionNumberQuery)
    const getRevisionNumberResponseRow = _get(getRevisionNumberResponse, 'rows[0]') || []
    const revisionNumber = getRevisionNumberResponseRow ? _get(getRevisionNumberResponseRow, 'revision_number') || null : null
    return revisionNumber
  },
  ownershipProxy: async input => {
    const { urbitId } = input
    console.log('running node.ownershipProxy')
    const getOwnershipProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = 1 order by time desc limit 1;`
    const getOwnershipProxyResponse = await query(getOwnershipProxyQuery)
    const ownershipProxy = _get(getOwnershipProxyResponse, 'rows[0].address') || 'no_address'
    return ownershipProxy
  },
  spawnProxy: async input => {
    const { urbitId } = input
    console.log('running node.spawnProxy')
    const getSpawnProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = 2 order by time desc limit 1;`
    const getSpawnProxyResponse = await query(getSpawnProxyQuery)
    const spawnProxy = _get(getSpawnProxyResponse, 'rows[0].address') || 'no_address'
    return spawnProxy
  },
  transferProxy: async input => {
    const { urbitId } = input
    console.log('running node.transferProxy')
    const getTransferProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = 3 order by time desc limit 1;`
    const getTransferProxyResponse = await query(getTransferProxyQuery)
    const transferProxy = _get(getTransferProxyResponse, 'rows[0].address') || 'no_address'
    return transferProxy
  },
  managementProxy: async input => {
    const { urbitId } = input
    console.log('running node.managementProxy')
    const getManagementProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = 4 order by time desc limit 1;`
    const getManagementProxyResponse = await query(getManagementProxyQuery)
    const managementProxy = _get(getManagementProxyResponse, 'rows[0].address') || 'no_address'
    return managementProxy
  },
  votingProxy: async input => {
    const { urbitId } = input
    console.log('running node.votingProxy')
    const getVotingProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = 5 order by time desc limit 1;`
    const getVotingProxyResponse = await query(getVotingProxyQuery)
    const votingProxy = _get(getVotingProxyResponse, 'rows[0].address') || 'no_address'
    return votingProxy
  }

}

module.exports = { ...node }
