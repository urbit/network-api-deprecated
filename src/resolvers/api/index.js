const { getActivity } = require('./getActivity')
const { getPKIEvents } = require('./getPKIEvents')
const { query } = require('../../utils')

const processNode = node => {
    
    const {
      node_id: urbitId,
      sponsor_id: sponsor,
      num_owners: numOwners,
      continuity_number: continuityNumber,
      revision_number: revisionNumber,
      ownership_proxy: ownershipProxy,
      spawn_proxy: spawnProxy,
      transfer_proxy: transferProxy,
      management_proxy: managementProxy,
      voting_proxy: votingProxy,
      status,
      kids
    } = node

    let nodeType = null

    if (urbitId.length === 4) {
      nodeType = 'GALAXY'
    } else if (urbitId.length === 7) {
      nodeType = 'STAR'
    } else if (urbitId.length === 14) {
      nodeType = 'PLANET'
    }

    return {
      urbitId,
      sponsor,
      numOwners,
      continuityNumber,
      revisionNumber,
      ownershipProxy,
      spawnProxy,
      transferProxy,
      managementProxy,
      votingProxy,
      status,
      kids,
      nodeType
    }
}

const apiResolvers = {
  getNode: async (_, { input: { urbitId: nodeId } }) => {
    const response = await query(`select * from node where node_id = '${nodeId}' limit 1;`)
    const node = response.rows[0]
    return await processNode(node)
  },
  getNodes: async (_, { input: { q = '%', nodeTypes = [], limit = 0, offset = 0 } }) => {
    let excludedNodeIDLengths = []
    !nodeTypes.includes('GALAXY') && excludedNodeIDLengths.push(4)
    !nodeTypes.includes('STAR') && excludedNodeIDLengths.push(7)
    !nodeTypes.includes('PLANET') && excludedNodeIDLengths.push(14)

    let queryString = `select * from node where node_id like '${q}%'`
    excludedNodeIDLengths.forEach(length => queryString += ` and length(node_id) != ${length}`)
    limit && (queryString += ` limit ${limit}`)
    offset && (queryString += ` offset ${offset}`)
    queryString += `;`
    const response = await query(queryString)
    const responseRows = response.rows || []

    let nodes = []
    responseRows.forEach(row => {
      nodes.push(processNode(row))
    })
    return nodes
  },
  getActivity: (_, args) => getActivity(_, args),
  getPKIEvents: (_, args) => getPKIEvents(_, args)
}

module.exports = apiResolvers
