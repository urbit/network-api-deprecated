const _get                      = require('lodash.get')

const { query, connect, end }   = require('../utils')

const getNode = async (_, args) => {
  const { urbitId } = args.input

  await connect()

  let nodeType = null

  if (urbitId.length === 4) {
    nodeType = 'GALAXY'
  } else if (urbitId.length === 7) {
    nodeType = 'STAR'
  } else if (urbitId.length === 14) {
    nodeType = 'PLANET'
  }

  const getNumOwnersQuery = `select count(*) from pki_events where node_id = '${urbitId}' and event_type_id = '1';`
  const getNumOwnersResponse = await query(getNumOwnersQuery)

  let numOwners = parseInt(_get(getNumOwnersResponse, 'rows[0].count')) || 1

  let sponsors = []
  
  // sponsor
  const getSponsorQuery = `select sponsor_id from pki_events where node_id = '${urbitId}' order by time desc limit 1;`
  const getSponsorResponse = await query(getSponsorQuery)

  const sponsor = getSponsorResponse.rows[0] ? getSponsorResponse.rows[0].sponsor_id : null

  sponsors.push(sponsor)

  // sponsor's sponsor
  const getSponsorsSponsorQuery = `select sponsor_id from pki_events where node_id = '${sponsor}' order by time desc limit 1;`
  const getSponsorsSponsorResponse = await query(getSponsorsSponsorQuery)
  const sponsorsSponsor = getSponsorsSponsorResponse.rows[0] ? getSponsorsSponsorResponse.rows[0].sponsor_id : null

  if (sponsorsSponsor) {
    sponsors.push(sponsorsSponsor)
  }

  // status
  let statusId
  let getStatusIdQuery = `select count(result) from radar where ship_name = '${urbitId}';`
  let getStatusIdResponse
  try {
    getStatusIdResponse = await query(getStatusIdQuery)

    if (_get(getStatusIdResponse, 'rows[0].count') === '0') {
      getStatusIdQuery = `select count(*) from pki_events where node_id = '${urbitId}' and event_type_id = '6';`
      getStatusIdResponse = await query(getStatusIdQuery)
      
      if (_get(getStatusIdResponse, 'rows[0].count') === '0') {
        getStatusIdQuery = `select count(*) from pki_events where node_id = '${urbitId}' and event_type_id = '7';`
        getStatusIdResponse = await query(getStatusIdQuery)

        if (_get(getStatusIdResponse, 'rows[0].count') === '0') {
          getStatusIdQuery = `select count(*) from pki_events where node_id = '${urbitId}' and address = '0x86cd9cd0992f04231751e3761de45cecea5d1801' or address = '0x8c241098c3d3498fe1261421633fd57986d74aea';`
          getStatusIdResponse = await query(getStatusIdQuery)
          
          if (_get(getStatusIdResponse, 'rows[0].count') === '0') {
            statusId = 1
          } else {
            statusId = 2
          }
        } else {
          statusId = 3
        }
      } else {
        statusId = 4
      }
    } else {
      statusId = 5
    }
  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }

  // kids
  const getKidsQuery = `select distinct node_id from pki_events where sponsor_id = '${urbitId}';`
  const getKidsResponse = await query(getKidsQuery)
  let kids = []

  for (let i in getKidsResponse.rows) {
    kids.push(getKidsResponse.rows[i].node_id)
  }

  // continuity number
  const getContinuityNumberQuery = `select continuity_number from pki_events where node_id = '${urbitId}' order by time desc limit 1;`
  const getContinuityNumberResponse = await query(getContinuityNumberQuery)
  const continuityNumber = getContinuityNumberResponse.rows[0] ? getContinuityNumberResponse.rows[0].continuity_number : null

  // revision number
  const getRevisionNumberQuery = `select revision_number from pki_events where node_id = '${urbitId}' order by time desc limit 1;`
  const getRevisionNumberResponse = await query(getRevisionNumberQuery)
  const revisionNumber = getRevisionNumberResponse.rows[0] ? getRevisionNumberResponse.rows[0].revision_number : null

  // ownership proxy
  const getOwnershipProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = '1' order by time desc limit 1;`
  const getOwnershipProxyResponse = await query(getOwnershipProxyQuery)
  const ownershipProxy = _get(getOwnershipProxyResponse, 'rows[0].address') || 'no_address'

  // spawn proxy
  const getSpawnProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = '2' order by time desc limit 1;`
  const getSpawnProxyResponse = await query(getSpawnProxyQuery)
  const spawnProxy = _get(getSpawnProxyResponse, 'rows[0].address') || 'no_address'

  // transfer proxy
  const getTransferProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = '3' order by time desc limit 1;`
  const getTransferProxyResponse = await query(getTransferProxyQuery)
  const transferProxy = _get(getTransferProxyResponse, 'rows[0].address') || 'no_address'

  // management proxy
  const getManagementProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = '4' order by time desc limit 1;`
  const getManagementProxyResponse = await query(getManagementProxyQuery)
  const managementProxy = _get(getManagementProxyResponse, 'rows[0].address') || 'no_address'

  // voting proxy
  const getVotingProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = '5' order by time desc limit 1;`
  const getVotingProxyResponse = await query(getVotingProxyQuery)
  const votingProxy = _get(getVotingProxyResponse, 'rows[0].address') || 'no_address'

  await end()
  
  return { 
    urbitId, 
    nodeType, 
    numOwners, 
    sponsors,
    statusId,
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