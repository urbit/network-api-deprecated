const _get = require('lodash.get')
const format = require('pg-format')

const { query } = require('../utils')
const { addToDB } = require('./utils/addToDB')

const populatePKIEvents = async () => {
  const rawEventsQueryString = format('select * from %I;', 'raw_events')
  const rawEventsResponse = await query(rawEventsQueryString)
  const rawEventsRows = _get(rawEventsResponse, 'rows') || []

  await addToDB('pki_events', rawEventsRows)
  return true
}

module.exports = { populatePKIEvents }
