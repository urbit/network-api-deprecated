const { query } = require('../../../utils')

const getNodeType = node_id => {

  switch(node_id.length) {
    case 4:
      return 'GALAXY'
    case 7:
      return 'STAR'
    case 14:
      return 'PLANET'
    default:
      return null
  }
}

const processNode = async node => {
  
  let {
    node_id,
    sponsor_id,
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
  
  let sponsor

  sponsor = {
    urbitId: sponsor_id,
    sponsor: null,
    numOwners: 1,
    continuityNumber: null,
    revisionNumber: null,
    ownershipProxy: null,
    spawnProxy: null,
    transferProxy: null,
    managementProxy: null,
    votingProxy: null,
    status: 'NOTAVAILABLE',
    kids: null,
    nodeType: getNodeType(sponsor_id)
  }

  let kidsNodes = []
  if (kids && kids.length > 0) {
    for (let kid of kids) {
      let kidResponse = await query(`select * from node where node_id = '${kid}' limit 1;`)
      let row = kidResponse?.rows?.[0]
      row && kidsNodes.push(await processNode(row))
    }
  }

  nodeType = getNodeType(node_id)

  return {
    urbitId: node_id,
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
    kids: kidsNodes,
    nodeType
  }
}

module.exports = processNode