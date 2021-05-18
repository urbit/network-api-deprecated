const format = require('pg-format')
const _get = require('lodash.get')

const { query } = require('../utils')

const getActivity = async (_, args) => {
  const urbitId = _get(args, 'input.urbitId') || null
  const since = _get(args, 'input.since') || null
  const until = _get(args, 'input.until') || null

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

  const returnArr = []
  const responseDates = []

  const rows = _get(getActivityResponse, 'rows') || []

  if (rows.length > 0) {
    for (const i in rows) {
      const online = _get(rows, `[${i}].online`) || false
      let response_time = _get(rows, `[${i}].response_time`) || null
      if (response_time) {
        response_time = response_time.toISOString().split('T', 1)[0]
      }

      if (!responseDates.includes(response_time)) {
        returnArr.push({ urbitId, active: online, date: response_time })
        responseDates.push(response_time)
      }
    }
  }
  
  return returnArr
}

module.exports = { getActivity }
