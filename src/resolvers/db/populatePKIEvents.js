const format        = require('pg-format')
const { Client }    = require('pg')

const { addToDB }   = require('./utils/addToDB')

const populatePKIEvents = async () => {
  console.log('running populatePKIEvents')

  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  let rawEventsResponse
  try {
    const rawEventsQueryString = format(`select * from %I;`, 'raw_events')
    rawEventsResponse = await client.query(rawEventsQueryString)
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  const rawEventsRows = rawEventsResponse.rows

  try {
    await client.end()
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  }
  
  try {
    await addToDB('pki_events', rawEventsRows)
  } catch (error) {
    throw error
  }
  
  return true
  
}

module.exports = { populatePKIEvents }