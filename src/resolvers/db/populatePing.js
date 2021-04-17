const _get = require('lodash.get')
const format = require('pg-format')

const { query, connect, end } = require('../utils')
const { addToDB } = require('./utils/addToDB')

const populatePing = async () => {
  await connect()
  const radarQueryString = format('select * from %I;', 'radar')
  const radarResponse = await query(radarQueryString)
  const radarRows = _get(radarResponse, 'rows') || []
  await end()
  await addToDB('ping', radarRows)
  return true
}

module.exports = { populatePing }
