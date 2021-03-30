const { Client }    = require('pg')
const format        = require('pg-format')
const axios         = require('axios')
const https         = require('https')
const ob            = require('urbit-ob')
const ajs           = require('azimuth-js')
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
  } else if (tableName === 'radar') {
    columnsWithoutTypes = [
      'SHIP_NAME',
      'PING',
      'RESULT',
      'RESPONSE'
    ]
    columnsAndTypes = `${columnsWithoutTypes.join(' VARCHAR, ')} VARCHAR`
  }

  const createTableQuery = format('CREATE TABLE %I (%s);', tableName, columnsAndTypes)

  try {
    const createTableResponse = await client
      .query(createTableQuery)
  } catch (error) {
    console.log(`createTableResponse error: ${error}`)
    throw error
  }

  let insertQuery

  if (tableName === 'pki_events') {

    insertQuery = format(`INSERT INTO %I (%s, %s, %s, %s, %s, %s, %s) VALUES`, tableName, columnsWithoutTypes[1], columnsWithoutTypes[2], columnsWithoutTypes[3], columnsWithoutTypes[4], columnsWithoutTypes[5], columnsWithoutTypes[6], columnsWithoutTypes[7])
    
    let contracts 
    try {
      contracts = await ajs.initContractsPartial(web3, ajs.azimuth.mainnet)
    } catch (error) {
      console.log(`initContractsPartial error: ${error}`)
    }

    for (let i in getDataResponse) {
    // for (let i = 0; i < 500; i++) {
      if (i > 0) {
        insertQuery += `,`
      }

      const node_id = getDataResponse[i][1]
      const event_type = 2
      const time = getDataResponse[i][0]
      const pointNumber = parseInt(ob.patp2dec(node_id))

      let sponsor_id 
      
      try {
        sponsor_id = await azimuth.getSponsor(contracts, pointNumber) || null
        sponsor_id = ob.patp(sponsor_id)
      } catch (error) {
        console.log(`getSponsor error: ${error}`)
      }

      const address = getDataResponse[i][3] || null

      let continuity_number

      try {
        continuity_number = parseInt(await azimuth.getContinuityNumber(contracts, pointNumber)) || null
      } catch (error) {
        console.log(`getContinuityNumber error: ${error}`)
      }

      let revision_number

      try {
        revision_number = parseInt(await azimuth.getRevisionNumber(contracts, pointNumber)) || null
      } catch (error) {
        console.log(`getRevisionNumber error: ${error}`)
      }

      insertQuery += format(` ('%s', '%s', %L, '%s', '%s', %L, %L)`, node_id, event_type, time, sponsor_id, address, continuity_number, revision_number)
    }
    insertQuery += ';'

  } else if (tableName === 'radar') {

    insertQuery = format(`INSERT INTO %I (%s, %s, %s, %s) VALUES`, tableName, 'SHIP_NAME', 'PING', 'RESULT', 'RESPONSE')
    const ships = Object.keys(getDataResponse)

    for (let i in ships) {
      if (i > 0) {
        insertQuery += `,`
      }

      if (getDataResponse[ships[i]].length === 0) {
        insertQuery += format(` ('$%s', '-1', '-1', '-1')`, ships[i] || null)
      } else {
        for (let j in getDataResponse[ships[i]]) {
          if (j > 0) {
            insertQuery += `,`
          }
          insertQuery += format(` ('$%s', '$%s', '$%s', '$%s')`, ships[i] || null, getDataResponse[ships[i]][j]['ping'] || -1, getDataResponse[ships[i]][j]['result'] || -1, getDataResponse[ships[i]][j]['response'] || -1)
        }
      }
    }

    insertQuery += ';'
  }

  try {
    const addDataResponse = await client.query(insertQuery)
    console.log("🚀 ~ file: db.js ~ line 106 ~ addToDB ~ addDataResponse", addDataResponse)
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
  const agent = new https.Agent({  
    rejectUnauthorized: false
   })

  let events
  try {
    events = await axios.get('https://azimuth.network/stats/events.txt', { httpsAgent: agent })
    events = events.data
  } catch (error) {
    throw error
  }

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

  for (let i in events) {
    let splitString = events[i]
    let splitStringArray = splitString.split(',')
    if (splitStringArray[splitStringArray.length - 1] === '') {
      splitStringArray.pop()
    }
    events[i] = splitStringArray
    
    events[i][0] = convertDateToISO(events[i][0])
  }
  
  try {
    await addToDB('pki_events', txtColumns, events)
  } catch (error) {
    throw error
  }
  
  return true
  
}


const dbResolvers = {
  populateRadar: () => populateRadar(),
  populatePKIEvents: () => populatePKIEvents()
}

module.exports = dbResolvers
