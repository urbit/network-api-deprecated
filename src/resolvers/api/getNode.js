const _get = require('lodash.get')

const { query, getNodeStatus } = require('../utils')

const getNode = async (_, args) => {
  const { urbitId } = _get(args, 'input.urbitId') || null

  let nodeType = null

  if (urbitId.length === 4) {
    nodeType = 'GALAXY'
  } else if (urbitId.length === 7) {
    nodeType = 'STAR'
  } else if (urbitId.length === 14) {
    nodeType = 'PLANET'
  }

  const getNumOwnersQuery = `select count(*) from pki_events where node_id = '${urbitId}' and event_name = 'change_ownership';`
  const getNumOwnersResponse = await query(getNumOwnersQuery)

  const numOwners = parseInt(_get(getNumOwnersResponse, 'rows[0].count')) || 1

  const sponsors = []

  // sponsor
  const getSponsorQuery = `select sponsor_id from pki_events where node_id = '${urbitId}' order by time desc limit 1;`
  const getSponsorResponse = await query(getSponsorQuery)
  const getSponsorResponseRow = _get(getSponsorResponse, 'rows[0]') || []

  const sponsor = getSponsorResponseRow ? _get(getSponsorResponseRow, 'sponsor_id') || null : null

  sponsors.push(sponsor)

  // sponsor's sponsor
  const getSponsorsSponsorQuery = `select sponsor_id from pki_events where node_id = '${sponsor}' order by time desc limit 1;`
  const getSponsorsSponsorResponse = await query(getSponsorsSponsorQuery)
  const getSponsorsSponsorResponseRow = _get(getSponsorsSponsorResponse, 'rows[0]') || []
  const sponsorsSponsor = getSponsorsSponsorResponseRow ? _get(getSponsorsSponsorResponseRow, 'sponsor_id') || null : null

  if (sponsorsSponsor) {
    sponsors.push(sponsorsSponsor)
  }

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
  const getOwnershipProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_name = 'change_ownership' order by time desc limit 1;`
  const getOwnershipProxyResponse = await query(getOwnershipProxyQuery)
  const ownershipProxy = _get(getOwnershipProxyResponse, 'rows[0].address') || 'no_address'

  // spawn proxy
  const getSpawnProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_name = 'change_spawn_proxy' order by time desc limit 1;`
  const getSpawnProxyResponse = await query(getSpawnProxyQuery)
  const spawnProxy = _get(getSpawnProxyResponse, 'rows[0].address') || 'no_address'

  // transfer proxy
  const getTransferProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_name = 'change_transfer_proxy' order by time desc limit 1;`
  const getTransferProxyResponse = await query(getTransferProxyQuery)
  const transferProxy = _get(getTransferProxyResponse, 'rows[0].address') || 'no_address'

  // management proxy
  const getManagementProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_name = 'change_management_proxy' order by time desc limit 1;`
  const getManagementProxyResponse = await query(getManagementProxyQuery)
  const managementProxy = _get(getManagementProxyResponse, 'rows[0].address') || 'no_address'

  // voting proxy
  const getVotingProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_name = 'change_voting_proxy' order by time desc limit 1;`
  const getVotingProxyResponse = await query(getVotingProxyQuery)
  const votingProxy = _get(getVotingProxyResponse, 'rows[0].address') || 'no_address'

  return {
    urbitId,
    nodeType,
    numOwners,
    sponsors,
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
