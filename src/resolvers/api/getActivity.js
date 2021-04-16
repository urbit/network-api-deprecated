const { Client }    = require('pg')
const format        = require('pg-format')
const _get          = require('lodash.get')

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

module.exports = { getActivity }