const _get = require('lodash.get')

const { query, getNodeStatus } = require('../../utils')

const getNode = async (_, args) => {
  console.log("🚀 ~ file: getNode.js ~ line 6 ~ getNode ~ args", args)
  const urbitId = _get(args, 'input.urbitId') || null
  console.log("🚀 ~ file: getNode.js ~ line 8 ~ getNode ~ urbitId", urbitId)

  let nodeType = null

  if (urbitId.length === 4) {
    nodeType = 'GALAXY'
  } else if (urbitId.length === 7) {
    nodeType = 'STAR'
  } else if (urbitId.length === 14) {
    nodeType = 'PLANET'
  }

  // number of owners
  const getNumOwnersQuery = `select count(*) from pki_events where node_id = '${urbitId}' and event_type_id = 1;`
  const getNumOwnersResponse = await query(getNumOwnersQuery)

  const numOwners = parseInt(_get(getNumOwnersResponse, 'rows[0].count')) || 1

  // sponsor
  const getSponsorQuery = `select sponsor_id from pki_events where node_id = '${urbitId}' order by time desc limit 1;`
  const getSponsorResponse = await query(getSponsorQuery)
  const getSponsorResponseRow = _get(getSponsorResponse, 'rows[0]') || []
  console.log("🚀 ~ file: getNode.js ~ line 29 ~ getNode ~ getSponsorResponseRow", getSponsorResponseRow)
  
  const sponsor = getSponsorResponseRow ? _get(getSponsorResponseRow, 'sponsor_id') || null : null

  // status
  const status = await getNodeStatus(urbitId)

  // kids
  const getKidsQuery = `select distinct node_id from pki_events where sponsor_id = '${urbitId}';`
  const getKidsResponse = await query(getKidsQuery)
  const getKidsResponseRows = _get(getKidsResponse, 'rows') || []
  const kids = getKidsResponseRows.map(row => row.node_id)

  // continuity number
  const getContinuityNumberQuery = `select continuity_number from pki_events where node_id = '${urbitId}' order by time desc limit 1;`
  const getContinuityNumberResponse = await query(getContinuityNumberQuery)
  const getContinuityNumberResponseRow = _get(getContinuityNumberResponse, 'rows[0]') || []
  const continuityNumber = getContinuityNumberResponseRow ? _get(getContinuityNumberResponseRow, 'continuity_number') || null : null

  // revision number
  const getRevisionNumberQuery = `select revision_number from pki_events where node_id = '${urbitId}' order by time desc limit 1;`
  const getRevisionNumberResponse = await query(getRevisionNumberQuery)
  const getRevisionNumberResponseRow = _get(getRevisionNumberResponse, 'rows[0]') || []
  const revisionNumber = getRevisionNumberResponseRow ? _get(getRevisionNumberResponseRow, 'revision_number') || null : null

  // ownership proxy
  const getOwnershipProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = 1 order by time desc limit 1;`
  const getOwnershipProxyResponse = await query(getOwnershipProxyQuery)
  const ownershipProxy = _get(getOwnershipProxyResponse, 'rows[0].address') || 'no_address'

  // spawn proxy
  const getSpawnProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = 2 order by time desc limit 1;`
  const getSpawnProxyResponse = await query(getSpawnProxyQuery)
  const spawnProxy = _get(getSpawnProxyResponse, 'rows[0].address') || 'no_address'

  // transfer proxy
  const getTransferProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = 3 order by time desc limit 1;`
  const getTransferProxyResponse = await query(getTransferProxyQuery)
  const transferProxy = _get(getTransferProxyResponse, 'rows[0].address') || 'no_address'

  // management proxy
  const getManagementProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = 4 order by time desc limit 1;`
  const getManagementProxyResponse = await query(getManagementProxyQuery)
  const managementProxy = _get(getManagementProxyResponse, 'rows[0].address') || 'no_address'

  // voting proxy
  const getVotingProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = 5 order by time desc limit 1;`
  const getVotingProxyResponse = await query(getVotingProxyQuery)
  const votingProxy = _get(getVotingProxyResponse, 'rows[0].address') || 'no_address'

  return {
    urbitId,
    nodeType,
    numOwners,
    sponsor,
    status,
    kids,
    continuityNumber,
    revisionNumber,
    ownershipProxy,
    spawnProxy,
    transferProxy,
    managementProxy,
    votingProxy
  }
}

module.exports = { getNode }
