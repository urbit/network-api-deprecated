const format = require('pg-format')

const { query } = require('../../utils')

const getActivity = async (_, { input: { urbitId, since, until } }) => {
  
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
  const responseDates = {}

  const rows = getActivityResponse?.rows || []

  if (rows.length > 0) {
    rows.forEach(row => {
      let { online = false , response_time: responseTime } = row
      if (responseTime) {
        responseTime = responseTime.toISOString().split('T', 1)[0]
      }

      if (!responseDates[responseTime]) {
        returnArr.push({ urbitId, active: online, date: responseTime })
        responseDates[responseTime] = true
      }
    })
  }
  
  return returnArr
}

module.exports = getActivity