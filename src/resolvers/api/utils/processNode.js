const { query } = require('../../../utils')

const getNodeType = node_id => {
  if (node_id.length === 4) {
    return 'GALAXY'
  } else if (node_id.length === 7) {
    return 'STAR'
  } else if (node_id.length === 14) {
    return 'PLANET'
  } else {
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
    console.log("🚀 ~ file: processNode.js ~ line 31 ~ kids", kids)
  
  let sponsor

  // if (sponsor_id !== node_id) {
    
  //   let sponsorResponse = await query(`select * from node where node_id = '${sponsor_id}' limit 1;`)
    
  //   if (sponsorResponse.rows.length > 0) {
  //     let sponsorNode = sponsorResponse?.rows?.[0]
  //     sponsor = await processNode(sponsorNode)
  //     console.log("🚀 ~ file: processNode.js ~ line 46 ~ sponsor", sponsor)
  //   } else {
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
  //   }
  // } else {
  //   sponsor = node
  // }

  let kidsNodes = []
  if (kids.length > 0) {
    console.log("🚀 ~ file: processNode.js ~ line 67 ~ kids", kids)
    for (let kid of kids) {
      console.log("🚀 ~ file: processNode.js ~ line 67 ~ kid", kid)
      let kidResponse = await query(`select * from node where node_id = '${kid}' limit 1;`)
      let row = kidResponse?.rows?.[0]
      console.log("🚀 ~ file: processNode.js ~ line 70 ~ row", row)
      // row && kidsNodes.push(row)
      row && kidsNodes.push(await processNode(row))
    }
  }

  // console.log("🚀 ~ file: processNode.js ~ line 79 ~ kidsNodes", kidsNodes)

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