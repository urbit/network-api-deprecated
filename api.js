const { Client }    = require('pg')
const format        = require('pg-format')
const _get           = require('lodash.get')

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

  // return { urbitId }
  // PROXIES
  // ownership (is this just what is currently the 'address' column)?
  // spawn (Creates new child points given Ethereum address. For stars and galaxies only.)
  // transfer -- leave this out, as it is the same as management proxy
  // voting (only for galaxies)
  // management (The management proxy can configure or set Arvo networking keys and conduct sponsorship-related operations.)



  // query =+ `select top 1 value from pki_events where node_id = '~fognys-moslux'`
  // query += format(` order by %s desc`, 'time')
  // query += ';'
}

const getNodes = async (_, args) => {
  console.log('running getNodes')
  // const { q, node_types, limit, offset } = args.input

  const q = _get(args, 'input.q') || '%'
  const nodeTypes = _get(args, 'input.nodeTypes') || []
  const limit = _get(args, 'input.limit') || 0
  const offset = _get(args, 'input.offset') || 0

  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  let pointNameQuery = `select * from raw_events where point like '${q}%';`
  console.log("🚀 ~ file: api.js ~ line 308 ~ getNodes ~ pointNameQuery", pointNameQuery)

  let pointNameResponse
  try {
    console.log('inside try')
    pointNameResponse = await client
      .query(pointNameQuery)
    console.log("🚀 ~ file: api.js ~ line 37 ~ getNode ~ pointNameResponse", pointNameResponse)
  } catch (error) {
    console.log(`pointNameResponse error: ${error}`)
    throw error
  }

  console.log("🚀 ~ file: api.js ~ line 324 ~ getNodes ~ pointNameResponse.rows", pointNameResponse.rows)

  try {
    client.end()
    console.log('client.end() try')
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  }

  let returnArr = []
  if (pointNameResponse.rows.length === 0) {
    return returnArr
  } else {
    console.log('in else')
    let potentialShips = []
    for (let i in pointNameResponse.rows) {
      console.log("🚀 ~ file: api.js ~ line 346 ~ getNodes ~ pointNameResponse.rows[i]", pointNameResponse.rows[i])
      let point = pointNameResponse.rows[i].point
      if (!potentialShips.includes(point)) {
        potentialShips.push(point)
      }
    }
      
    console.log("🚀 ~ file: api.js ~ line 355 ~ getNodes ~ potentialShips", potentialShips)

    for (let i in potentialShips) {
      if (nodeTypes.length > 0) {
        if (!nodeTypes.includes('GALAXY')) {
          if (potentialShips[i].length ===  4) {
            continue
          }
        } else if (!nodeTypes.includes('STAR')) {
          if (potentialShips[i].length ===  7) {
            continue
          }
        } else if (!nodeTypes.includes('PLANET')) {
          if (potentialShips[i].length ===  14) {
            continue
          }
        }
      }

      let node
      try {
        node = await getNode(_, { input: { urbitId: potentialShips[i] } })
      } catch (error) {
        console.log(`pointNameResponse error: ${error}`)
        throw error
      }

      returnArr.push(node)
    }

    for (let i = offset; i > 0; i--) {
      returnArr = returnArr.slice(1)
    }

    for (let i = limit; i > 0; i--) {
      returnArr = returnArr.slice(0, limit)
    }

    console.log("🚀 ~ file: api.js ~ line 363 ~ getNodes ~ returnArr", returnArr)
    return returnArr
  }
}

// const urbitId = async (_, args) => {
//   const { urbitId } = args
//   return urbitId
// }

// const nodeType = async (_, args) => {
//   const { urbitId } = args

//   let nodeType = null
//   if (urbitId.length === 4) {
//     nodeType = 'GALAXY'
//   } else if (urbitId.length === 7) {
//     nodeType = 'STAR'
//   } else if (urbitId.length === 14) {
//     nodeType = 'PLANET'
//   }

//   return nodeType
// }

// const continuity = async (_, args) => {
//   const { urbitId } = args

//   const getContinuityNumberQuery = `select continuity_number from pki_events where node_id = ${urbitId} order by time desc limit 1;`

//   let getContinuityNumberResponse
//   try {
//     getContinuityNumberResponse = await client
//       .query(getContinuityNumberQuery)
//     console.log("🚀 ~ file: api.js ~ line 27 ~ getNode ~ getContinuityNumberResponse", getContinuityNumberResponse)
//   } catch (error) {
//     console.log(`addDataResponse error: ${error}`)
//     throw error
//   }

//   const continuityNumber = getContinuityNumberResponse.rows[0].continuity_number ? getContinuityNumberResponse.rows[0].continuity_number : null
//   return continuityNumber
// }

// const revision = async (_, args) => {
//   const { urbitId } = args

//   const getRevisionNumberQuery = `select revision_number from pki_events where node_id = ${urbitId} order by time desc limit 1;`

//   let getRevisionNumberResponse
//   try {
//     getRevisionNumberResponse = await client
//       .query(getRevisionNumberQuery)
//     console.log("🚀 ~ file: api.js ~ line 27 ~ getNode ~ getRevisionNumber", getRevisionNumber)
//   } catch (error) {
//     console.log(`addDataResponse error: ${error}`)
//     throw error
//   }

//   const revisionNumber = getRevisionNumberResponse.rows[0].revision_number ? getRevisionNumberResponse.rows[0].revision_number : null
//   return revisionNumber
// }

// const sponsors = async (_, args) => {
//   const { urbitId } = args

//   let sponsorsArray = []
  
//   // sponsor
//   // `select sponsor_id from pki_events where node_id = '~fognys-moslux' order by time desc limit 1;`
//   const getSponsorQuery = `select sponsor_id from pki_events where node_id = ${urbitId} order by time desc limit 1;`

//   let getSponsorResponse
//   try {
//     getSponsorResponse = await client
//       .query(getSponsorQuery)
//     console.log("🚀 ~ file: api.js ~ line 27 ~ getNode ~ getSponsorResponse", getSponsorResponse)
//   } catch (error) {
//     console.log(`addDataResponse error: ${error}`)
//     throw error
//   }

//   const sponsor = getSponsorResponse.rows[0].sponsorId

//   sponsorsArray.push(sponsor)

//   const getSponsorsSponsorQuery = `select sponsor_id from pki_events where node_id = ${sponsor} order by time desc limit 1;`
//   // select sponsor_id from pki_events where node_id = '~fognys-moslux' order by time desc limit 1;

//   // sponsor's sponsor
//   // get sponsor from right above and then feed it into the same sql query
//   let getSponsorsSponsorResponse
//   try {
//     getSponsorsSponsorResponse = await client
//       .query(getSponsorsSponsorQuery)
//     console.log("🚀 ~ file: api.js ~ line 27 ~ getNode ~ getSponsorsSponsorResponse", getSponsorsSponsorResponse)
//   } catch (error) {
//     console.log(`addDataResponse error: ${error}`)
//     throw error
//   }

//   const sponsorsSponsor = getSponsorsSponsorResponse.rows[0].sponsorId

//   if (sponsorsSponsor) {
//     sponsorsArray.push(sponsorsSponsor)
//   }

//   return sponsorsArray
// }

const getPKIEvents = async (_, args) => {

  const { urbitId, since, nodeTypes, limit, offset } = args.input

  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  let acceptablePointNameLengths = []
  
  if (nodeTypes.includes('PLANET')) {
    acceptablePointNameLengths.push(14)
  }
  if (nodeTypes.includes('STAR')) {
    acceptablePointNameLengths.push(7)
  }
  if (nodeTypes.includes('GALAXY')) {
    acceptablePointNameLengths.push(4)
  }
  

  let query

  query = format(`select %s as "%s", %s as "%s", %s as "%s", %s, %s as "%s", %s, %s as "%s", %s as "%s" from %I where`, 'event_id', 'eventId', 'node_id', 'nodeId', 'event_type_id', 'eventTypeId', 'time', 'sponsor_id', 'sponsorId', 'address', 'continuity_number', 'continuityNumber', 'revision_number', 'revisionNumber',  'pki_events')
  if (since) {
    query += format(` %I < '%s'`, 'time', since)
  }
  if (nodeTypes && nodeTypes.length > 0) {
    if (since) {
      query += ` and`
    }

    if (acceptablePointNameLengths.length === 1) {
      query += format(` length(%s)=%s`, 'node_id', acceptablePointNameLengths[0])
    } else {
      query += ` (`
      for (let i in acceptablePointNameLengths) {
        query += format(`length(%s)=%s`, 'node_id', acceptablePointNameLengths[i])
        if (parseInt(i) !== acceptablePointNameLengths.length - 1) {
          query += ` or `
        }
      }
      query += `)`
    }
  }
  if (urbitId) {
    if (since || (nodeTypes && nodeTypes.length > 0)) {
      query += format(` and %s='%s'`, 'node_id', urbitId)
    }
  }
  query += format(` order by %s desc`, 'time')
  if (limit) {
    query += format(` limit %s`, limit)
  }
  if (offset) {
    query += format(` offset %s`, offset)
  }
  query += `;`
  console.log("🚀 ~ file: api.js ~ line 139 ~ getPKIEvents ~ query", query)

  let addDataResponse
  try {
    addDataResponse = await client
      .query(query)
    console.log("🚀 ~ file: db.js ~ line 106 ~ addToDB ~ addDataResponse", addDataResponse)
  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }

  try {
    client.end()
    console.log('client.end() try')
    return addDataResponse.rows
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  } 
}

const getActivity = async (_, args) => {

  let { urbitId, since, until } = args.input

  if (!urbitId) {
    urbitId = null
  }

  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  let query

  query = format(`select * from %I`, 'ping')
  if (since || until || urbitId) {
    query += ' where'
  }
  if (since) {
    query += format(` %I < '%s'`, 'response_time', since)
  }

  if (until) {
    if (since) {
      query += ' and'
    }
    query += format(` %I > '%s'`, 'response_time', until)
  }
  
  if (urbitId) {
    if (since || until) {
      query += ' and'
    }
    query += format(` %s='%s'`, 'node_id', urbitId)
  }

  query += format(` order by %s desc`, 'response_time')
  query += `;`
  console.log("🚀 ~ file: api.js ~ line 482 ~ getActivity ~ query", query)

  
  let getActivityResponse
  try {
    getActivityResponse = await client
      .query(query)
    console.log("🚀 ~ file: db.js ~ line 106 ~ addToDB ~ getActivityResponse", getActivityResponse)
  } catch (error) {
    console.log(`getActivityResponse error: ${error}`)
    throw error
  }

  try {
    client.end()
    console.log('client.end() try')
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  } 

  let returnArr = []
  let responseDates = []

  if (getActivityResponse.rows.length > 0) {
    console.log("🚀 ~ file: api.js ~ line 521 ~ getActivity ~ getActivityResponse.rows", getActivityResponse.rows)
    for (let i in getActivityResponse.rows) {
      const online = _get(getActivityResponse.rows[i], 'online') || false
      let response_time = _get(getActivityResponse.rows[i], 'response_time') || null
      if (response_time) {
        response_time = response_time.toISOString().split('T', 1)[0]
      }

      if (!responseDates.includes(response_time)) {
        returnArr.push({urbitId, active: online, date: response_time})
        responseDates.push(response_time)
      }
    }
  } else {
    returnArr.push({urbitId, active: false, date: null})
  }
    return returnArr
}

const apiResolvers = {
  getNode: (_, args) => getNode(_, args),
  getNodes: (_, args) => getNodes(_, args),
  getActivity: (_, args) => getActivity(_, args),
  getPKIEvents: (_, args) => getPKIEvents(_, args)
}

module.exports = apiResolvers