const format = require('pg-format')
const _get = require('lodash.get')

const { query, connect, end } = require('../utils')

const getActivity = async (_, args) => {
  let { urbitId, since, until } = args.input

  if (!urbitId) {
    urbitId = null
  }

  await connect()

  let queryString

  queryString = format('select * from %I', 'ping')
  if (since || until || urbitId) {
    queryString += ' where'
  }
  if (since) {
    queryString += format(' %I < \'%s\'', 'response_time', since)
  }

  if (until) {
    if (since) {
      queryString += ' and'
    }
    queryString += format(' %I > \'%s\'', 'response_time', until)
  }

  if (urbitId) {
    if (since || until) {
      queryString += ' and'
    }
    queryString += format(' %s=\'%s\'', 'node_id', urbitId)
  }

  queryString += format(' order by %s desc', 'response_time')
  queryString += ';'

  const getActivityResponse = await query(queryString)

  await end()

  const returnArr = []
  const responseDates = []

  if (getActivityResponse.rows.length > 0) {
    for (const i in getActivityResponse.rows) {
      const online = _get(getActivityResponse.rows[i], 'online') || false
      let response_time = _get(getActivityResponse.rows[i], 'response_time') || null
      if (response_time) {
        response_time = response_time.toISOString().split('T', 1)[0]
      }

      if (!responseDates.includes(response_time)) {
        returnArr.push({ urbitId, active: online, date: response_time })
        responseDates.push(response_time)
      }
    }
  } else {
    returnArr.push({ urbitId, active: false, date: null })
  }
  return returnArr
}

module.exports = { getActivity }
