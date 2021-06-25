const _get = require('lodash.get')
const format = require('pg-format')

const { query } = require('../utils')

const populatePing = async () => {
  const radarQueryString = format('select * from %I;', 'radar')
  let radarQueryResponse
  try {
    radarQueryResponse = await query(radarQueryString)
  } catch (error) {
    console.log("🚀 ~ file: populatePing.js ~ line 28 ~ populatePing ~ error", error)
    throw error
  }

  const getDataResponse = _get(radarQueryResponse, 'rows') || []

  if (getDataResponse.length === 0) {
    return
  }

  insertQuery = format('INSERT INTO %I (%s, %s, %s, %s) VALUES', 'ping', 'NODE_ID', 'ONLINE', 'PING_TIME', 'RESPONSE_TIME')
  
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

  try {
    return await query(insertQuery)
  } catch (error) {
    console.log("🚀 ~ file: populatePing.js ~ line 53 ~ populatePing ~ error", error)
    throw error
  }
}

module.exports = { populatePing }
