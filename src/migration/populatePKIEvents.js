const format = require('pg-format')

const { query } = require('../utils')

const populatePKIEvents = async () => {
  const rawEventsQueryString = format('select * from %I;', 'raw_events')
  const rawEventsQueryResponse = await query(rawEventsQueryString)
  const getDataResponse = rawEventsQueryResponse?.rows || []

  insertQuery = format('INSERT INTO %I (%s, %s, %s, %s, %s, %s, %s) VALUES', 'pki_events', 'NODE_ID', 'EVENT_TYPE_ID', 'TIME', 'SPONSOR_ID', 'ADDRESS', 'CONTINUITY_NUMBER', 'REVISION_NUMBER')

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

  let iteratorLimit
  if (process.env.NODE_ENV === 'prod') {
    iteratorLimit = getDataResponse.length
  } else {
    iteratorLimit = 600
  }

  for (let i = 0; i < iteratorLimit; i++) {
    if (i % 100 === 0) {
      console.log(`row in populatePKIEvents: ${i}`)
    }

    if (i > 0) {
      insertQuery += ','
    }

    const { date, point, event, field1, field2, field3 } = getDataResponse[i]

    const time = date
    const node_id = point

    const event_type_id = eventTypeKey?.[event] || 13

    let sponsor_id = null

    if (node_id.length === 4) {
      sponsor_id = node_id
    } else {
      const latestEscapedToEventQuery = `select field2 from raw_events where point = '${node_id}' and event = 'sponsor' and field1 = 'escaped to';`
      
      let latestEscapedToEventResponse
      try {
        latestEscapedToEventResponse = await query(latestEscapedToEventQuery)
      } catch (error) {
        console.log("🚀 ~ file: populatePKIEvents.js ~ line 63 ~ populatePKIEvents ~ error", error)
        throw error
      }
      
      if (latestEscapedToEventResponse.rows.length > 0) {
        sponsor_id = latestEscapedToEventResponse?.rows?.[0]?.field2 || null
      } else if (node_id.length === 7) {
        sponsor_id = `~${node_id.slice(4)}`
      } else {
        const spawnedEventQuery = `select point from raw_events where event = 'spawned' and field1 = '${node_id}';`
        
        let spawnedEventResponse
        try {
          spawnedEventResponse = await query(spawnedEventQuery)
        } catch (error) {
          console.log("🚀 ~ file: populatePKIEvents.js ~ line 78 ~ populatePKIEvents ~ error", error)
          throw error
        }

        sponsor_id = spawnedEventResponse?.rows?.[0]?.point|| null
      }
    }

    let address
    field1.length === 42 ? address = field1 : field2.length === 42 ? address = field2 : field3.length === 42 ? address = field3 : address = null

    const continuityNumberQuery = `select field1 from (select * from raw_events order by date desc limit ${i + 1}) as nested where point = '${node_id}' and event = 'breached' order by date desc limit 1;`
    
    let continuityNumberResponse
    try {
      continuityNumberResponse = await query(continuityNumberQuery)
    } catch (error) {
      console.log("🚀 ~ file: populatePKIEvents.js ~ line 96 ~ populatePKIEvents ~ error", error)
      throw error
    }

    const continuity_number = continuityNumberResponse?.rows?.[0]?.field1 || 1

    const revisionNumberQuery = `select field1 from (select * from raw_events order by date desc limit ${i + 1}) as nested where point = '${node_id}' and event = 'keys' order by date desc limit 1;`
    
    let revisionNumberResponse
    try {
      revisionNumberResponse = await query(revisionNumberQuery)
    } catch (error) {
      console.log("🚀 ~ file: populatePKIEvents.js ~ line 108 ~ populatePKIEvents ~ error", error)
      throw error
    }

    const revision_number = revisionNumberResponse?.rows?.[0]?.field1 || 1

    insertQuery += format(' (\'%s\', \'%s\', %L, \'%s\', \'%s\', %L, %L)', node_id, event_type_id, time, sponsor_id, address, continuity_number, revision_number)
  }

  insertQuery += ';'

  try {
    return await query(insertQuery)
  } catch (error) {
    console.log("🚀 ~ file: populatePKIEvents.js ~ line 120 ~ populatePKIEvents ~ error", error)
    throw error
  }
}

module.exports = { populatePKIEvents }