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

module.exports = processNode