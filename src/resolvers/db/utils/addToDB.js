const format = require('pg-format')
const _get = require('lodash.get')

const { query } = require('../../utils')

// Later change this to just update the DB instead of delete and replace
const addToDB = async (tableName, getDataResponse) => {
  console.log(`running addToDB with this tableName: ${tableName}`)

  const deleteTableQuery = format('DROP TABLE IF EXISTS %I;', tableName)
  await query(deleteTableQuery)

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
    const createTableQuery = format('CREATE TABLE %I (%s);', tableName, columnsAndTypes)
    await query(createTableQuery)
  }

  let insertQuery

  if (tableName === 'pki_events') {
    insertQuery = format('INSERT INTO %I (%s, %s, %s, %s, %s, %s, %s) VALUES', tableName, columnsWithoutTypes[1], columnsWithoutTypes[2], columnsWithoutTypes[3], columnsWithoutTypes[4], columnsWithoutTypes[5], columnsWithoutTypes[6], columnsWithoutTypes[7])

    // TODO: Check for all of these in the code that populates the events.txt
    const eventTypeKey = {
      owner: 1,
      'spawn-p': 2,
      'transfer-p': 3,
      'management-p': 4,
      'voting-p': 5,
      activated: 6,
      spawned: 7,
      'escape-req': 8,
      // 'escape-can' or an equivalent does not seem to exist--follow up about this
      // it is possible that no one has ever tried this
      'escape-can': 9,
      'escaped to': 10,
      // 'lost-sponsor' does not exist. Not sure what this should be
      'lost-sponsor': 11,
      // make sure 'breached' is same as 'broke_continuity'
      breached: 12
    }

    // Can use the following line for testing when needed:
    // for (let i = 0; i < 400; i++) {
    for (let i = 0; i < getDataResponse.length; i++) {
      if (i % 200 === 0) {
        console.log(`iterator in addToDB: ${i}`)
      }

      if (i > 0) {
        insertQuery += ','
      }

      const { date, point, event, field1, field2, field3 } = getDataResponse[i]

      const time = date
      const node_id = point

      const event_type = _get(eventTypeKey, event) || 13

      let sponsor_id = null

      if (node_id.length === 4) {
        sponsor_id = node_id
      } else {
        const latestEscapedToEventQuery = `select field2 from raw_events where point = '${node_id}' and event = 'sponsor' and field1 = 'escaped to';`
        const latestEscapedToEventResponse = await query(latestEscapedToEventQuery)

        if (latestEscapedToEventResponse.rows.length > 0) {
          sponsor_id = _get(latestEscapedToEventResponse, 'rows[0].field2') || null
        } else if (node_id.length === 7) {
          sponsor_id = `~${node_id.slice(4)}`
        } else {
          const spawnedEventQuery = `select point from raw_events where event = 'spawned' and field1 = '${node_id}';`
          const spawnedEventResponse = await query(spawnedEventQuery)
          sponsor_id = _get(spawnedEventResponse, 'rows[0].point') || null
        }
      }

      let address
      field1.length === 42 ? address = field1 : field2.length === 42 ? address = field2 : field3.length === 42 ? address = field3 : address = null

      const continuityNumberQuery = `select field1 from (select * from raw_events order by date desc limit ${i + 1}) as nested where point = '${node_id}' and event = 'breached' order by date desc limit 1;`
      const continuityNumberResponse = await query(continuityNumberQuery)
      const continuity_number = _get(continuityNumberResponse, 'rows[0].field1') || 1

      const revisionNumberQuery = `select field1 from (select * from raw_events order by date desc limit ${i + 1}) as nested where point = '${node_id}' and event = 'keys' order by date desc limit 1;`
      const revisionNumberResponse = await query(revisionNumberQuery)
      const revision_number = _get(revisionNumberResponse, 'rows[0].field1') || 1

      insertQuery += format(' (\'%s\', \'%s\', %L, \'%s\', \'%s\', %L, %L)', node_id, event_type, time, sponsor_id, address, continuity_number, revision_number)
    }
    console.log('just past iterator in addToDB')
    insertQuery += ';'
  } else if (tableName === 'raw_events') {
    insertQuery = format('INSERT INTO %I (%s, %s, %s, %s, %s, %s) VALUES', tableName, 'DATE', 'POINT', 'EVENT', 'FIELD1', 'FIELD2', 'FIELD3')
    getDataResponse.forEach(item => {

      const [date, point, event] = item
      let field1
      let field2
      let field3

      if (item.length > 3 && item[3] !== '') {
        field1 = item[3]
      } else {
        field1 = null
      }
      if (item.length > 4 && item[4] !== '') {
        field2 = item[4]
      } else {
        field2 = null
      }
      if (item.length > 5 && item[5] !== '') {
        field3 = item[5]
      } else {
        field3 = null
      }

      if (i > 0) {
        insertQuery += ','
      }

      insertQuery += format(' (\'%s\', \'%s\', \'%s\', \'%s\', \'%s\', \'%s\')', date, point, event, field1, field2, field3)
    })

    insertQuery += ';'
  } else if (tableName === 'radar') {
    insertQuery = format('INSERT INTO %I (%s, %s, %s, %s) VALUES', tableName, 'SHIP_NAME', 'PING', 'RESULT', 'RESPONSE')
    const ships = Object.keys(getDataResponse)

    ships.forEach((shipKey, index) => {

      if (index > 0) {
        insertQuery += ','
      }

      const { ship: shipKey } = getDataResponse

      if (ship.length === 0) {
        insertQuery += format(' (\'%s\', %L, %L, %L)', shipKey || null, null, null, null)
      } else {
        ship.forEach((thisShip, index) => {
          if (index > 0) {
            insertQuery += ','
          }

          const ping = _get(thisShip, `[${j}].ping`) || -1
          const result = _get(thisShip, `[${j}].result`) || -1
          const response = _get(thisShip, `[${j}].response`) || -1
          insertQuery += format(' (\'%s\', \'%s\', \'%s\', \'%s\')', thisShip, ping, result, response)
        })
      }
    })

    insertQuery += ';'
  } else if (tableName === 'ping') {
    insertQuery = format('INSERT INTO %I (%s, %s, %s, %s) VALUES', tableName, 'NODE_ID', 'ONLINE', 'PING_TIME', 'RESPONSE_TIME')
    getDataResponse.forEach((item, index) => {
      const { ship_name, ping, response } = item
      if (index > 0) {
        insertQuery += ','
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
      insertQuery += format(' (\'%s\', \'%s\', %L, %L)', ship_name, online, pingTime, responseTime)
    })
    insertQuery += ';'
  } else if (tableName === 'node_status') {
    insertQuery = format('INSERT INTO %I (%s) VALUES (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\');', tableName, 'STATUS_NAME', 'locked', 'unlocked', 'spawned', 'activated', 'online')
  } else if (tableName === 'event_type') {
    insertQuery = format('INSERT INTO %I (%s) VALUES (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\'), (\'%s\');', tableName, 'EVENT_NAME', 'change_ownership', 'change_spawn_proxy', 'change_transfer_proxy', 'change_management_proxy', 'change_voting_proxy', 'activate', 'spawn', 'escape_requested', 'escape_cancelled', 'escape_accepted', 'lost_sponsor', 'broke_continuity')
  } else if (tableName === 'node_type') {
    insertQuery = format('DROP TYPE IF EXISTS node_type; CREATE TYPE %I AS ENUM (\'%s\' ,\'%s\' ,\'%s\', \'%s\', \'%s\');', tableName, 'galaxy', 'star', 'planet', 'comet', 'moon')
  }

  return await query(insertQuery)
}

module.exports = { addToDB }
