const _get = require('lodash.get')
const format = require('pg-format')

const { query } = require('../utils')
const { addToDB } = require('./utils/addToDB')

const populatePing = async () => {
  const radarQueryString = format('select * from %I;', 'radar')
  const radarResponse = await query(radarQueryString)
  const radarRows = _get(radarResponse, 'rows') || []

  await addToDB('ping', radarRows)
  return true
}

populatePing()
