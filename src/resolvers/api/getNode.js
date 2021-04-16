const { Client }    = require('pg')
const _get          = require('lodash.get')

const getNode = async (_, args) => {
  // console.log('running getNode')
  const { urbitId } = args.input

  // console.log("🚀 ~ file: api.js ~ line 7 ~ getNode ~ urbitId", urbitId)

  const client = new Client()

  try {
    await client.connect()
    // console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  let nodeType = null

  if (urbitId.length === 4) {
    nodeType = 'GALAXY'
  } else if (urbitId.length === 7) {
    nodeType = 'STAR'
  } else if (urbitId.length === 14) {
    nodeType = 'PLANET'
  }
  

  // console.log("🚀 ~ file: api.js ~ line 18 ~ getNode ~ nodeType", nodeType)

  const getNumOwnersQuery = `select count(*) from pki_events where node_id = '${urbitId}' and event_type_id = '1';`

  let getNumOwnersResponse
  try {
    getNumOwnersResponse = await client
      .query(getNumOwnersQuery)
    // console.log("🚀 ~ file: api.js ~ line 37 ~ getNode ~ getNumOwnersResponse", getNumOwnersResponse)
  } catch (error) {
    console.log(`getNumOwnersResponse error: ${error}`)
    throw error
  }

  let numOwners = parseInt(_get(getNumOwnersResponse, 'rows[0].count')) || 1

  let sponsors = []
  
  // sponsor
  // `select sponsor_id from pki_events where node_id = '~fognys-moslux' order by time desc limit 1;`
  const getSponsorQuery = `select sponsor_id from pki_events where node_id = '${urbitId}' order by time desc limit 1;`

  let getSponsorResponse
  try {
    getSponsorResponse = await client
      .query(getSponsorQuery)
    // console.log("🚀 ~ file: api.js ~ line 27 ~ getNode ~ getSponsorResponse", getSponsorResponse)
  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }

  const sponsor = getSponsorResponse.rows[0] ? getSponsorResponse.rows[0].sponsor_id : null
  // console.log("🚀 ~ file: api.js ~ line 47 ~ getNode ~ getSponsorResponse.rows[0]", getSponsorResponse.rows[0])
  // console.log("🚀 ~ file: api.js ~ line 47 ~ getNode ~ sponsor", sponsor)

  sponsors.push(sponsor)

  const getSponsorsSponsorQuery = `select sponsor_id from pki_events where node_id = '${sponsor}' order by time desc limit 1;`
  // select sponsor_id from pki_events where node_id = '~fognys-moslux' order by time desc limit 1;

  // sponsor's sponsor
  // get sponsor from right above and then feed it into the same sql query
  let getSponsorsSponsorResponse
  try {
    getSponsorsSponsorResponse = await client
      .query(getSponsorsSponsorQuery)
    // console.log("🚀 ~ file: api.js ~ line 27 ~ getNode ~ getSponsorsSponsorResponse", getSponsorsSponsorResponse)
  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }

  const sponsorsSponsor = getSponsorsSponsorResponse.rows[0] ? getSponsorsSponsorResponse.rows[0].sponsor_id : null

  if (sponsorsSponsor) {
    sponsors.push(sponsorsSponsor)
  }

  // start status section

  let statusId
  let getStatusIdQuery = `select count(result) from radar where ship_name = '${urbitId}';`
  let getStatusIdResponse
  try {
    getStatusIdResponse = await client
      .query(getStatusIdQuery)

    if (parseInt(getStatusIdResponse.rows[0].count) === 0) {
      getStatusIdQuery = `select count(*) from pki_events where node_id = '${urbitId}' and event_type_id = '6';`
      getStatusIdResponse = await client
        .query(getStatusIdQuery)
      
      if (parseInt(getStatusIdResponse.rows[0].count) === 0) {
        getStatusIdQuery = `select count(*) from pki_events where node_id = '${urbitId}' and event_type_id = '7';`
        getStatusIdResponse = await client
          .query(getStatusIdQuery)

        if (parseInt(getStatusIdResponse.rows[0].count) === 0) {
          getStatusIdQuery = `select count(*) from pki_events where node_id = '${urbitId}' and address = '0x86cd9cd0992f04231751e3761de45cecea5d1801' or address = '0x8c241098c3d3498fe1261421633fd57986d74aea';`
          getStatusIdResponse = await client
            .query(getStatusIdQuery)
          
          if (parseInt(getStatusIdResponse.rows[0].count) === 0) {
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
    // console.log("🚀 ~ file: api.js ~ line 27 ~ getNode ~ getStatusIdResponse", getStatusIdResponse)
  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }

  // end status section
  

  // kids
  const getKidsQuery = `select distinct node_id from pki_events where sponsor_id = '${urbitId}';`
  let getKidsResponse
  try {
    getKidsResponse = await client
      .query(getKidsQuery)
    // console.log("🚀 ~ file: api.js ~ line 27 ~ getNode ~ getKidsResponse", getKidsResponse)
  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }

  let kids = []

  for (let i in getKidsResponse.rows) {
    kids.push(getKidsResponse.rows[i].node_id)
  }

  // console.log("🚀 ~ file: api.js ~ line 92 ~ getNode ~ kids", kids)

  // continuity
  // select continuity_number from pki_events where node_id = '~fognys-moslux' order by time desc limit 1;
  // select continuity_number from pki_events where node_id = '~wanfeb' order by time desc limit 1;
  // select coalesce (continuity_number) from pki_events where node_id = '~wanfeb' order by time desc limit 1;
  // select coalesce (continuity_number, '1') from pki_events where node_id = '~fognys-moslux' and continuity_number != '0' order by time desc;
  const getContinuityNumberQuery = `select continuity_number from pki_events where node_id = '${urbitId}' order by time desc limit 1;`

  let getContinuityNumberResponse
  try {
    getContinuityNumberResponse = await client
      .query(getContinuityNumberQuery)
    // console.log("🚀 ~ file: api.js ~ line 27 ~ getNode ~ getContinuityNumberResponse", getContinuityNumberResponse)
  } catch (error) {
    console.log(`getContinuityNumberResponse error: ${error}`)
    throw error
  }

  const continuityNumber = getContinuityNumberResponse.rows[0] ? getContinuityNumberResponse.rows[0].continuity_number : null

  // key revision
  // select revision_number from pki_events where node_id = '~fognys-moslux' order by time desc limit 1;
  // select coalesce (revision_number) from pki_events where node_id = '~wanfeb' order by time desc limit 1;
  // select coalesce (revision_number, '1') from pki_events where node_id = '~fognys-moslux' and revision_number != '0' order by time desc;
  const getRevisionNumberQuery = `select revision_number from pki_events where node_id = '${urbitId}' order by time desc limit 1;`

  let getRevisionNumberResponse
  try {
    getRevisionNumberResponse = await client
      .query(getRevisionNumberQuery)
    // console.log("🚀 ~ file: api.js ~ line 27 ~ getNode ~ getRevisionNumberResponse", getRevisionNumberResponse)
  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }

  const revisionNumber = getRevisionNumberResponse.rows[0] ? getRevisionNumberResponse.rows[0].revision_number : null

  const getOwnershipProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = '1' order by time desc limit 1;`

  let getOwnershipProxyResponse
  try {
    getOwnershipProxyResponse = await client
      .query(getOwnershipProxyQuery)
    // console.log("🚀 ~ file: api.js ~ line 37 ~ getNode ~ getOwnershipProxyResponse", getOwnershipProxyResponse)
  } catch (error) {
    console.log(`getOwnershipProxyResponse error: ${error}`)
    throw error
  }

  const ownershipProxy = _get(getOwnershipProxyResponse, 'rows[0].address') || 'no_address'

  const getSpawnProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = '2' order by time desc limit 1;`

  let getSpawnProxyResponse
  try {
    getSpawnProxyResponse = await client
      .query(getSpawnProxyQuery)
    // console.log("🚀 ~ file: api.js ~ line 37 ~ getNode ~ getSpawnProxyResponse", getSpawnProxyResponse)
  } catch (error) {
    console.log(`getSpawnProxyResponse error: ${error}`)
    throw error
  }

  const spawnProxy = _get(getSpawnProxyResponse, 'rows[0].address') || 'no_address'

  const getTransferProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = '3' order by time desc limit 1;`

  let getTransferProxyResponse
  try {
    getTransferProxyResponse = await client
      .query(getTransferProxyQuery)
    // console.log("🚀 ~ file: api.js ~ line 37 ~ getNode ~ getTransferProxyResponse", getTransferProxyResponse)
  } catch (error) {
    console.log(`getTransferProxyResponse error: ${error}`)
    throw error
  }

  const transferProxy = _get(getTransferProxyResponse, 'rows[0].address') || 'no_address'

  const getManagementProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = '4' order by time desc limit 1;`

  let getManagementProxyResponse
  try {
    getManagementProxyResponse = await client
      .query(getManagementProxyQuery)
    // console.log("🚀 ~ file: api.js ~ line 37 ~ getNode ~ getManagementProxyResponse", getManagementProxyResponse)
  } catch (error) {
    console.log(`getManagementProxyResponse error: ${error}`)
    throw error
  }

  const managementProxy = _get(getManagementProxyResponse, 'rows[0].address') || 'no_address'

  const getVotingProxyQuery = `select address from pki_events where node_id = '${urbitId}' and event_type_id = '5' order by time desc limit 1;`

  let getVotingProxyResponse
  try {
    getVotingProxyResponse = await client
      .query(getVotingProxyQuery)
    // console.log("🚀 ~ file: api.js ~ line 37 ~ getNode ~ getVotingProxyResponse", getVotingProxyResponse)
  } catch (error) {
    console.log(`getVotingProxyResponse error: ${error}`)
    throw error
  }

  const votingProxy = _get(getVotingProxyResponse, 'rows[0].address') || 'no_address'

  try {
    client.end()
    // console.log('client.end() try')
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  }
  
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