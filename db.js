const { Client }    = require('pg')
const axios = require('axios')
const https = require('https')

// Later change this to just update the DB instead of delete and replace
const addToDB = async (tableName, columns, getDataResponse) => {
  
  const client = new Client()

  try {
    await client.connect()
    console.log('client connected')
  } catch (error) {
    console.log('client connect error')
    throw error
  }
  
  try {
    const deleteTableResponse = await client
      .query(`DROP TABLE IF EXISTS ${tableName}`)
  } catch (error) {
    console.log('deleteTableResponse error')
    throw error
  }

  const columnsAndTypes = `${columns.join(' VARCHAR, ')} VARCHAR`

  try {
    const createTableResponse = await client
      .query(`CREATE TABLE ${tableName} (${columnsAndTypes});`)
  } catch (error) {
    console.log(`createTableResponse error: ${error}`)
    throw error
  }

  let query = `INSERT INTO ${tableName} (${columns[0]}, ${columns[1]}, ${columns[2]}, ${columns[3]}, ${columns[4]}, ${columns[5]}) VALUES`

  for (let i in getDataResponse) {
    if (i > 0) {
      query += `,`
    }
    query += ` ('${getDataResponse[i][0] || null}', '${getDataResponse[i][1] || null}', '${getDataResponse[i][2] || null}', '${getDataResponse[i][3] || null}', '${getDataResponse[i][4] || null}', '${getDataResponse[i][5] || null}')`
  }

  query += ';'

  try {

    const addDataResponse = await client
      .query(query)
    console.log("🚀 ~ file: db.js ~ line 106 ~ addToDB ~ addDataResponse", addDataResponse)
  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }

  try {
    let dbResponse = await client.end()
    console.log('client.end() try')
    dbResponse = JSON.stringify(dbResponse)
    return dbResponse
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  } 
}

// const populateRadar = async () => {
//   const getDataResponse = await axios.get('http://35.247.74.19:8080/~radar.json')
//   addToDB('RADAR', getDataResponse)
// }

const getPKIEvents = async () => {
  const agent = new https.Agent({  
    rejectUnauthorized: false
   })

  let events
  try {
    events = await axios.get('https://azimuth.network/stats/events.txt', { httpsAgent: agent })
    events = events.data
  } catch (error) {
    throw error
  }

  let columns = events.slice(0, events.indexOf('~')).split(',')
  for (let i in columns) {
    if (columns[i].includes('\n')) {
      columns[i] = columns[i].replace('\n', '')
    }
    if (columns[i].includes(' ')) {
      columns[i] = columns[i].replace(' ', '')
    }
    columns[i] = `${columns[i].toUpperCase()}`
  }

  events = events.slice(events.indexOf('~')).split('\n')

  for (let i in events) {
    let splitString = events[i]
    let splitStringArray = splitString.split(',')
    if (splitStringArray[splitStringArray.length - 1] === '') {
      splitStringArray.pop()
    }
    events[i] = splitStringArray
  }
  
  try {
    await addToDB('pki_events', columns, events)
  } catch (error) {
    throw error
  }
  

  return true
  
}


const dbResolvers = {
  // getDB: () => connectToDB(),
  // populateRadar: () => populateRadar(),
  getPKIEvents: () => getPKIEvents()
}

module.exports = dbResolvers