const { Client }    = require('pg')
const format        = require('pg-format')
const _get          = require('lodash.get')

// Later change this to just update the DB instead of delete and replace
const addToDB = async (tableName, getDataResponse) => {
  
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
      
      if (i > 0) {
        insertQuery += `,`
      }

      insertQuery += format(` ('%s', '%s', '%s', '%s', '%s', '%s')`, date, point, event, field1, field2, field3)

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
        insertQuery += format(` ('%s', %L, %L, %L)`, ships[i] || null, null, null, null)
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
  insertQuery = format(`DROP TYPE node_type; CREATE TYPE %I AS ENUM ('%s' ,'%s' ,'%s', '%s', '%s');`, tableName, 'galaxy', 'star', 'planet', 'comet', 'moon')
  console.log("🚀 ~ file: db.js ~ line 212 ~ addToDB ~ insertQuery", insertQuery)
}

  try {
    console.log('running addDataResponse')
    const addDataResponse = await client.query(insertQuery)
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

module.exports = { addToDB }