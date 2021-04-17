const format                  = require('pg-format')
const { query, connect, end } = require('../utils')

const populatePKIEvents = async () => {
  await connect()
  const rawEventsQueryString = format(`select * from %I;`, 'raw_events')
  const rawEventsResponse = await query(rawEventsQueryString)
  const rawEventsRows = _get(rawEventsResponse, 'rows') || []
  await end()
  await addToDB('pki_events', rawEventsRows)
  return true
}

module.exports = { populatePKIEvents }