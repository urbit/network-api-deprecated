const { Client }    = require('pg')
const format        = require('pg-format')
const axios         = require('axios')
const https         = require('https')
const ob            = require('urbit-ob')
const ajs           = require('azimuth-js')
const _get           = require('lodash.get')
const azimuth       = ajs.azimuth
const Web3          = require('web3')
const infura        = `https://mainnet.infura.io/v3/7014111724dc4d198c82cab378fa5453`

const provider      = new Web3.providers.HttpProvider(infura)
const web3          = new Web3(provider)

// Later change this to just update the DB instead of delete and replace
const addToDB = async (tableName, columns, getDataResponse) => {
  
  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  const deleteTableQuery = format('DROP TABLE IF EXISTS %I;', tableName)
  
  try {
    const deleteTableResponse = await client
      .query(deleteTableQuery)  
  } catch (error) {
    console.log(`deleteTableResponse error: ${error}`)
    throw error
  }

  let columnsAndTypes

  let columnsWithoutTypes

  if (tableName === 'pki_events') {
    columnsWithoutTypes = [
      'EVENT_ID', 
      'NODE_ID', 
      'EVENT_TYPE_ID',
      'TIME',
      'SPONSOR_ID', 
      'ADDRESS', 
      'CONTINUITY_NUMBER', 
      'REVISION_NUMBER'
    ]
    columnsAndTypes = [
      'EVENT_ID SERIAL NOT NULL', 
      'NODE_ID VARCHAR NOT NULL', 
      'EVENT_TYPE_ID INT NOT NULL', 
      'TIME TIMESTAMP NOT NULL', 
      'SPONSOR_ID VARCHAR', 
      'ADDRESS VARCHAR', 
      'CONTINUITY_NUMBER INT', 
      'REVISION_NUMBER INT'
    ]
    columnsAndTypes = columnsAndTypes.join(', ')
  } if (tableName === 'raw_events') {
    columnsWithoutTypes = [
      'DATE', 
      'POINT', 
      'EVENT',
      'FIELD1',
      'FIELD2',
      'FIELD3'
    ]
    columnsAndTypes = [
      'DATE VARCHAR', 
      'POINT VARCHAR', 
      'EVENT VARCHAR',
      'FIELD1 VARCHAR',
      'FIELD2 VARCHAR',
      'FIELD3 VARCHAR'
    ]
    columnsAndTypes = columnsAndTypes.join(', ')
  } else if (tableName === 'radar') {
    columnsWithoutTypes = [
      'SHIP_NAME',
      'PING',
      'RESULT',
      'RESPONSE'
    ]
    columnsAndTypes = `${columnsWithoutTypes.join(' VARCHAR, ')} VARCHAR`
  } else if (tableName === 'ping') {
    columnsAndTypes = [
      'PING_ID BIGSERIAL NOT NULL', 
      'NODE_ID VARCHAR NOT NULL', 
      'ONLINE BOOLEAN NOT NULL', 
      'PING_TIME TIMESTAMP',
      'RESPONSE_TIME TIMESTAMP'
    ]
  } else if (tableName === 'node_status') {
    columnsAndTypes = [
      'NODE_STATUS_ID SERIAL NOT NULL',
      'STATUS_NAME VARCHAR NOT NULL'
    ]
  } else if (tableName === 'event_type') {
    columnsAndTypes = [
      'EVENT_TYPE_ID SERIAL NOT NULL',
      'EVENT_NAME VARCHAR NOT NULL'
    ]
  }

  if (tableName !== 'node_type') {
    console.log(`columnsAndTypes: ${columnsAndTypes}`)
    const createTableQuery = format('CREATE TABLE %I (%s);', tableName, columnsAndTypes)

    try {
      const createTableResponse = await client
        .query(createTableQuery)
    } catch (error) {
      console.log(`createTableResponse error: ${error}`)
      throw error
    }

    console.log('created table')
  }
  

  let insertQuery

  if (tableName === 'pki_events') {

    // Need to update the following code to query the raw_events table instead of a GET
    insertQuery = format(`INSERT INTO %I (%s, %s, %s, %s, %s, %s, %s) VALUES`, tableName, columnsWithoutTypes[1], columnsWithoutTypes[2], columnsWithoutTypes[3], columnsWithoutTypes[4], columnsWithoutTypes[5], columnsWithoutTypes[6], columnsWithoutTypes[7])
    
    let contracts 
    try {
      contracts = await ajs.initContractsPartial(web3, ajs.azimuth.mainnet)
    } catch (error) {
      console.log(`initContractsPartial error: ${error}`)
    }

    console.log(`getDataResponse.length: ${getDataResponse.length}`)

    // Are there events that don't fit in this? And if so what are they?
    // Check for all of these in the code that populates the events.txt
    const eventTypeKey = {
      'owner': 1,
      'spawn-p': 2,
      'transfer-p': 3,
      'management-p': 4,
      'voting-p': 5,
      'activated': 6,
      'spawned': 7,
      'escape-req': 8,
      // 'escape-can' or an equivalent does not seem to exist--follow up about this
      // it is possible that no one has ever tried this
      'escape-can': 9,
      'escaped to': 10,
      // 'lost-sponsor' does not exist. Not sure what this should be
      'lost-sponsor': 11,
      // make sure 'breached' is same as 'broke_continuity'
      'breached': 12
    }

    // for (let i in getDataResponse) {
    for (let i = 0; i < 1000; i++) {
      if (i % 200 === 0) {
        console.log(`i: ${i}`)
      }
      
      if (i > 0) {
        insertQuery += `,`
      }

      let { date, point, event, field1, field2, field3 } = getDataResponse[i]

      const time = date
      const node_id = point
      
      const event_type = _get(eventTypeKey, event) || 13
      
      // const pointNumber = parseInt(ob.patp2dec(point))

      let sponsor_id = null

      if (node_id.length === 4) {
        sponsor_id = node_id
      } else {
        const latestEscapedToEventQuery = `select field2 from raw_events where point = '${node_id}' and event = 'sponsor' and field1 = 'escaped to';`
        let latestEscapedToEventResponse
        try {
          latestEscapedToEventResponse = await client
            .query(latestEscapedToEventQuery)
        } catch (error) {
          console.log(`createTableResponse error: ${error}`)
          throw error
        }
        if (latestEscapedToEventResponse.rows.length > 0) {
          sponsor_id = _get(latestEscapedToEventResponse, 'rows[0].field2') || null
        } else if (node_id.length === 7) {
          sponsor_id = `~${node_id.slice(4)}`
        } else {
          const spawnedEventQuery = `select point from raw_events where event = 'spawned' and field1 = '${node_id}';`
          let spawnedEventResponse
          try {
            spawnedEventResponse = await client
              .query(spawnedEventQuery)
          } catch (error) {
            console.log(`createTableResponse error: ${error}`)
            throw error
          }
          sponsor_id = _get(spawnedEventResponse, 'rows[0].point') || null
        }
      }

      // If there is no address associated with an event, it can just be null
      // Certain types of events are associated with addresses, others are not
      // const address = getDataResponse[i][3] || null
      // const address = 'sample_address'
      // let addressQuery = `select (field1, field2, field3) from (select * from raw_events order by date desc limit ${i + 1}) as nested where point = '~lompex-figrud' order by date desc limit 1;`
      // let addressResponse

      // try {
      //   addressResponse = await client
      //     .query(addressQuery)
      // } catch (error) {
      //   console.log(`createTableResponse error: ${error}`)
      //   throw error
      // }

      // address = _get(addressResponse, 'rows[0].field1') || 1
      let address
      field1.length === 42 ? address = field1 : field2.length === 42 ? address = field2 : field3.length === 42 ? address = field3 : address = null

      let continuity_number
      let continuityNumberQuery = `select field1 from (select * from raw_events order by date desc limit ${i + 1}) as nested where point = '${node_id}' and event = 'breached' order by date desc limit 1;`
      let continuityNumberResponse

      try {
        continuityNumberResponse = await client
          .query(continuityNumberQuery)
      } catch (error) {
        console.log(`createTableResponse error: ${error}`)
        throw error
      }

      continuity_number = _get(continuityNumberResponse, 'rows[0].field1') || 1

      // I think revision number is 'keys' event right?
      let revision_number
      let revisionNumberQuery = `select field1 from (select * from raw_events order by date desc limit ${i + 1}) as nested where point = '${node_id}' and event = 'keys' order by date desc limit 1;`
      let revisionNumberResponse

      try {
        revisionNumberResponse = await client
          .query(revisionNumberQuery)
      } catch (error) {
        console.log(`createTableResponse error: ${error}`)
        throw error
      }

      revision_number = _get(revisionNumberResponse, 'rows[0].field1') || 1

      insertQuery += format(` ('%s', '%s', %L, '%s', '%s', %L, %L)`, node_id, event_type, time, sponsor_id, address, continuity_number, revision_number)
    }
    insertQuery += ';'

  } else if (tableName === 'raw_events') {
    insertQuery = format(`INSERT INTO %I (%s, %s, %s, %s, %s, %s) VALUES`, tableName, 'DATE', 'POINT', 'EVENT', 'FIELD1', 'FIELD2', 'FIELD3')
    for (let i in getDataResponse) {
      let [ date, point, event ] = getDataResponse[i]
      let field1
      let field2
      let field3
      console.log("🚀 ~ file: db.js ~ line 273 ~ addToDB ~ getDataResponse[i][3]", getDataResponse[i][3])
      if (getDataResponse[i].length > 3 && getDataResponse[i][3] !== '') {
        field1 = getDataResponse[i][3]
      } else {
        field1 = null
      }
      if (getDataResponse[i].length > 4 && getDataResponse[i][4] !== '') {
        field2 = getDataResponse[i][4]
      } else {
        field2 = null
      }
      if (getDataResponse[i].length > 5 && getDataResponse[i][5] !== '') {
        field3 = getDataResponse[i][5]
      } else {
        field3 = null
      }
      console.log("🚀 ~ file: db.js ~ line 192 ~ addToDB ~ getDataResponse[i]", getDataResponse[i])
      console.log(`i: ${i}`)
      
      if (i > 0) {
        insertQuery += `,`
      }

      insertQuery += format(` ('%s', '%s', '%s', '%s', '%s', '%s')`, date, point, event, field1, field2, field3)

    }

    insertQuery += ';'
    // console.log("🚀 ~ file: db.js ~ line 299 ~ addToDB ~ insertQuery", insertQuery)
  } else if (tableName === 'radar') {

    insertQuery = format(`INSERT INTO %I (%s, %s, %s, %s) VALUES`, tableName, 'SHIP_NAME', 'PING', 'RESULT', 'RESPONSE')
    const ships = Object.keys(getDataResponse)

    for (let i in ships) {
      if (i > 0) {
        insertQuery += `,`
      }

      if (getDataResponse[ships[i]].length === 0) {
        // insertQuery += format(` ('%s', '-1', '-1', '-1')`, ships[i] || null)
        insertQuery += format(` ('%s', %L, %L, %L)`, ships[i] || null, null, null, null)
        // insertQuery += format(` ('%s')`, ships[i] || null)
        // insertQuery += format(` ('%s', 'null', 'null', 'null')`, ships[i] || null)
      } else {
        for (let j in getDataResponse[ships[i]]) {
          if (j > 0) {
            insertQuery += `,`
          }
          insertQuery += format(` ('%s', '%s', '%s', '%s')`, ships[i] || null, getDataResponse[ships[i]][j]['ping'] || -1, getDataResponse[ships[i]][j]['result'] || -1, getDataResponse[ships[i]][j]['response'] || -1)
        }
      }
    }

    insertQuery += ';'
  } else if (tableName === 'ping') {
    insertQuery = format(`INSERT INTO %I (%s, %s, %s, %s) VALUES`, tableName, 'NODE_ID', 'ONLINE', 'PING_TIME', 'RESPONSE_TIME')
    // console.log("🚀 ~ file: db.js ~ line 312 ~ addToDB ~ getDataResponse", getDataResponse)
    for (let i in getDataResponse) {
      let { ship_name, ping, response } = getDataResponse[i]
      if (i < 20) {
        console.log(`JSON.stringify(getDataResponse[i]): ${JSON.stringify(getDataResponse[i])}`)
        console.log(`ping: ${ping}`)
        console.log(`typeof ping: ${typeof ping}`)
      }
      if (i > 0) {
        insertQuery += `,`
      }
      let online
      if (ping === null) {
        online = false
      } else {
        online = true
      }
      console.log("🚀 ~ file: db.js ~ line 330 ~ addToDB ~ online", online)
      // ping !== '-1' ? online = true : online = false
      let pingTime
      let responseTime
      if (online) {
        pingTime = new Date(parseInt(ping)).toISOString()
        responseTime = new Date(parseInt(response)).toISOString()
      } else {
        pingTime = ping
        responseTime = response
      }
      insertQuery += format(` ('%s', '%s', %L, %L)`, ship_name, online, pingTime, responseTime)
    }
  insertQuery += ';'
} else if (tableName === 'node_status') {
  insertQuery = format(`INSERT INTO %I (%s) VALUES ('%s'), ('%s'), ('%s'), ('%s'), ('%s');`, tableName, 'STATUS_NAME', 'locked', 'unlocked', 'spawned', 'activated', 'online')
} else if (tableName === 'event_type') {
  insertQuery = format(`INSERT INTO %I (%s) VALUES ('%s'), ('%s'), ('%s'), ('%s'), ('%s'), ('%s'), ('%s'), ('%s'), ('%s'), ('%s'), ('%s'), ('%s');`, tableName, 'EVENT_NAME', 'change_ownership', 'change_spawn_proxy', 'change_transfer_proxy', 'change_management_proxy', 'change_voting_proxy', 'activate', 'spawn', 'escape_requested', 'escape_cancelled', 'escape_accepted', 'lost_sponsor', 'broke_continuity')
  console.log("🚀 ~ file: db.js ~ line 212 ~ addToDB ~ insertQuery", insertQuery)
} else if (tableName === 'node_type') {
  insertQuery = format(`CREATE TYPE %I AS ENUM ('%s' ,'%s' ,'%s', '%s', '%s');`, tableName, 'galaxy', 'star', 'planet', 'comet', 'moon')
  console.log("🚀 ~ file: db.js ~ line 212 ~ addToDB ~ insertQuery", insertQuery)
}

  try {
    console.log('running addDataResponse')
    const addDataResponse = await client.query(insertQuery)
    // console.log("🚀 ~ file: db.js ~ line 106 ~ addToDB ~ addDataResponse", addDataResponse)
  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }

  try {
    console.log('client.end() try for this table: ', tableName)
    await client.end()
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  } 
}

const populateRadar = async () => {
  console.log('running populateRadar')
  const agent = new https.Agent({  
    rejectUnauthorized: false
   })
  let events
  try {
    // The following can be used to test against the radar fixture in case the endpoint is down
    // Will need to copy in the fixture, which Chris has but which is not committed due to file size
    // events = JSON.parse(fs.readFileSync('_radar.json', 'utf8'))

    events = await axios.get('http://35.247.74.19:8080/~radar.json', { httpsAgent: agent })
    events = events.data
  } catch (error) {
    throw error
  }
  await addToDB('radar', null, events)
  return true
}

const convertDateToISO = dateToConvert => {
  let string = dateToConvert.slice(1)
  string = string.split('..')
  string[0] = string[0].replace(/\./g, '-')
  string[1] = string[1].replace(/\./g, ':') + '.000Z'
  string = string.join('T')
  return string
}

// pki_event
// ***
// event_id (pk)
// node_id (fk) not null
// event_type_id (fk) not null
// sponsor_id (fk)
// time not null
// address
// continuity_number
// revision_number
let columns = [ 'event_id', 'node_id', 'event_type_id', 'sponsor_id', 'time', 'address', 'continuity_number', 'revision_number']

const populatePKIEvents = async () => {
  console.log('running populatePKIEvents')
  // const agent = new https.Agent({  
  //   rejectUnauthorized: false
  //  })

  // let events
  // try {
  //   console.log('in populate pki events try')
  //   events = await axios.get('https://azimuth.network/stats/events.txt', { httpsAgent: agent })
  // } catch (error) {
  //   throw error
  // }

  // console.log('after populate pki events try')
  // events = events.data

  // let txtColumns = events.slice(0, events.indexOf('~')).split(',')
  // for (let i in txtColumns) {
  //   if (txtColumns[i].includes('\n')) {
  //     txtColumns[i] = txtColumns[i].replace('\n', '')
  //   }
  //   if (txtColumns[i].includes(' ')) {
  //     txtColumns[i] = txtColumns[i].replace(' ', '')
  //   }
  //   txtColumns[i] = `${txtColumns[i].toUpperCase()}`
  // }

  // events = events.slice(events.indexOf('~')).split('\n')

  // for (let i in events) {
  //   let splitString = events[i]
  //   let splitStringArray = splitString.split(',')
  //   if (splitStringArray[splitStringArray.length - 1] === '') {
  //     splitStringArray.pop()
  //   }
  //   events[i] = splitStringArray
    
  //   events[i][0] = convertDateToISO(events[i][0])
  // }

  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  let rawEventsResponse
  try {
    const rawEventsQueryString = format(`select * from %I;`, 'raw_events')
    rawEventsResponse = await client.query(rawEventsQueryString)
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  const rawEventsRows = rawEventsResponse.rows

  try {
    await client.end()
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  }
  
  try {
    // await addToDB('pki_events', txtColumns, rawEventsRows)
    await addToDB('pki_events', null, rawEventsRows)
  } catch (error) {
    throw error
  }
  
  return true
  
}

const populateRawEvents = async () => {
  console.log('running populateRawEvents')
  const agent = new https.Agent({  
    rejectUnauthorized: false
   })

  let events
  try {
    console.log('in populate pki events try')
    events = await axios.get('https://azimuth.network/stats/events.txt', { httpsAgent: agent })
  } catch (error) {
    throw error
  }

  console.log('after populate pki events try')
  events = events.data

  let txtColumns = events.slice(0, events.indexOf('~')).split(',')
  for (let i in txtColumns) {
    if (txtColumns[i].includes('\n')) {
      txtColumns[i] = txtColumns[i].replace('\n', '')
    }
    if (txtColumns[i].includes(' ')) {
      txtColumns[i] = txtColumns[i].replace(' ', '')
    }
    txtColumns[i] = `${txtColumns[i].toUpperCase()}`
  }

  events = events.slice(events.indexOf('~')).split('\n')

  let returnArr = []

  for (let i in events) {
    let splitString = events[i]
    let splitStringArray = splitString.split(',')
    // if (splitStringArray[splitStringArray.length - 1] === '') {
    //   splitStringArray.pop()
    // }

    let newArr = splitStringArray.map(x => {
      if (x === '') {
        return null
      } else {
        return x
      }
    })

    newArr[0] = convertDateToISO(newArr[0])
    returnArr.push(newArr)
    // events[i] = splitStringArray
    // events[i][0] = convertDateToISO(events[i][0])
  }
  
  try {
    // await addToDB('raw_events', txtColumns, events)
    await addToDB('raw_events', txtColumns, returnArr)
  } catch (error) {
    throw error
  }
  
  return true
  
}

const populatePing = async () => {

  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  let radarResponse
  try {
    const radarQueryString = format(`select * from %I;`, 'radar')
    console.log("🚀 ~ file: db.js ~ line 310 ~ populatePing ~ radarQueryString", radarQueryString)
    radarResponse = await client.query(radarQueryString)
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  const radarRows = radarResponse.rows

  try {
    await client.end()
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  } 
  await addToDB('ping', null, radarRows)
  return true
}

const populateNodeStatus = async () => {
  await addToDB('node_status', null, null)
  return true
}

const populateEventType = async () => {
  await addToDB('event_type', null, null)
  return true
}

const populateNodeType = async () => {
  await addToDB('node_type', null, null)
  return true
}


const dbResolvers = {
  populateRadar: () => populateRadar(),
  populatePKIEvents: () => populatePKIEvents(),
  populateRawEvents: () => populateRawEvents(),
  populatePing: () => populatePing(),
  populateNodeStatus: () => populateNodeStatus(),
  populateEventType: () => populateEventType(),
  populateNodeType: () => populateNodeType()
}

module.exports = dbResolvers
