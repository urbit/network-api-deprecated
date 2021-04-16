const format        = require('pg-format')
const { Client }    = require('pg')

const { addToDB }   = require('./utils/addToDB')

const populatePing = async () => {

  console.log('running populatePing')

  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  let radarResponse
  try {
    const radarQueryString = format(`select * from %I;`, 'radar')
    console.log("🚀 ~ file: db.js ~ line 310 ~ populatePing ~ radarQueryString", radarQueryString)
    radarResponse = await client.query(radarQueryString)
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }

  const radarRows = radarResponse.rows

  try {
    await client.end()
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  } 
  await addToDB('ping', radarRows)
  return true
}

module.exports = { populatePing }