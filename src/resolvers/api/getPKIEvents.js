const { Client }    = require('pg')
const format        = require('pg-format')

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

module.exports = { getPKIEvents }