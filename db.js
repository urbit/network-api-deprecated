const { Client }    = require('pg')
const format = require('pg-format')
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

  const deleteTableQuery = format('DROP TABLE IF EXISTS %I;', tableName)
  
  try {
    const deleteTableResponse = await client
      .query(deleteTableQuery)  
  } catch (error) {
    console.log(`deleteTableResponse error: ${error}`)
    throw error
  }

  let columnsAndTypes

  if (tableName === 'pki_events') {
    columnsAndTypes = `${columns.join(' VARCHAR, ')} VARCHAR`
  } else if (tableName === 'radar') {
    columnsAndTypes = `SHIP_NAME VARCHAR, PING VARCHAR, RESULT VARCHAR, RESPONSE VARCHAR`
  }

  const createTableQuery = format('CREATE TABLE %I (%s);', tableName, columnsAndTypes)

  try {
    const createTableResponse = await client
      .query(createTableQuery)
  } catch (error) {
    console.log(`createTableResponse error: ${error}`)
    throw error
  }

  let insertQuery

  if (tableName === 'pki_events') {
    insertQuery = format(`INSERT INTO %I (%s, %s, %s, %s, %s, %s) VALUES`, tableName, columns[0], columns[1], columns[2], columns[3], columns[4], columns[5])
    for (let i in getDataResponse) {
      if (i > 0) {
        insertQuery += `,`
      }
      insertQuery += format(` ('%s', '%s', '%s', '%s', '%s', '%s')`, getDataResponse[i][0] || null, getDataResponse[i][1] || null, getDataResponse[i][2] || null, getDataResponse[i][3] || null, getDataResponse[i][4] || null, getDataResponse[i][5] || null)
    }
    insertQuery += ';'
  } else if (tableName === 'radar') {

    insertQuery = format(`INSERT INTO %I (%s, %s, %s, %s) VALUES`, tableName, 'SHIP_NAME', 'PING', 'RESULT', 'RESPONSE')
    const ships = Object.keys(getDataResponse)

    for (let i in ships) {
      if (i > 0) {
        insertQuery += `,`
      }

      if (getDataResponse[ships[i]].length === 0) {
        insertQuery += format(` ('$%s', '-1', '-1', '-1')`, ships[i] || null)
      } else {
        for (let j in getDataResponse[ships[i]]) {
          if (j > 0) {
            insertQuery += `,`
          }
          insertQuery += format(` ('$%s', '$%s', '$%s', '$%s')`, ships[i] || null, getDataResponse[ships[i]][j]['ping'] || -1, getDataResponse[ships[i]][j]['result'] || -1, getDataResponse[ships[i]][j]['response'] || -1)
        }
      }
    }

    insertQuery += ';'
  }

  

  try {
    const addDataResponse = await client.query(insertQuery)
    console.log("🚀 ~ file: db.js ~ line 106 ~ addToDB ~ addDataResponse", addDataResponse)
  } catch (error) {
    console.log(`addDataResponse error: ${error}`)
    throw error
  }

  try {
    console.log('client.end() try for this table: ', tableName)
    await client.end()
  } catch (error) {
    console.log(`client.end() error: ${error}`)
    throw error
  } 
}

const populateRadar = async () => {
  console.log('running populateRadar')
  const agent = new https.Agent({  
    rejectUnauthorized: false
   })
  let events
  try {
    // The following can be used to test against the radar fixture in case the endpoint is down
    // Will need to copy in the fixture, which Chris has but which is not committed due to file size
    // events = JSON.parse(fs.readFileSync('_radar.json', 'utf8'))

    events = await axios.get('http://35.247.74.19:8080/~radar.json', { httpsAgent: agent })
    events = events.data
  } catch (error) {
    throw error
  }
  await addToDB('radar', null, events)
  return true
}

const populatePKIEvents = async () => {
  console.log('running populatePKIEvents')
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

  // Dates are in the following format
  // ~2021.3.24..21.28.47
  // ~YYYY.M.DD..HH.MM.SS or ~YYYY.MM.DD..HH.MM.SS
  // moment().format('MMMM Do YYYY, h:mm:ss a')
  const convertDateForMoment = dateToConvert => {
    // console.log("🚀 ~ file: db.js ~ line 155 ~ populatePKIEvents ~ dateToConvert", dateToConvert)
    let manipString = dateToConvert.slice(1)
    // console.log("🚀 ~ file: api.js ~ line 132 ~ getPKIEvents ~ manipString", manipString)
    manipString = manipString.split('..')
    // console.log("🚀 ~ file: api.js ~ line 134 ~ getPKIEvents ~ manipString", manipString)
    // manipString[0] = manipString[0].replace(/\./g, '-')

    // console.log("🚀 ~ file: api.js ~ line 136 ~ getPKIEvents ~ manipString[0]", manipString[0])
    // const found0 = manipString[0].match(/(?<=\-)(.*?)(?=\-)/)
    // if (found0[0] == found0[1]) {
    //   manipString[0].slice()
    // }
    // console.log("🚀 ~ file: api.js ~ line 137 ~ getPKIEvents ~ found", found)
    // if (manipString[0]s

    // console.log("🚀 ~ file: api.js ~ line 147 ~ getPKIEvents ~ manipString[0]", manipString[0])
    manipString[1] = manipString[1].replace(/\./g, ':')
    // console.log("🚀 ~ file: api.js ~ line 136 ~ getPKIEvents ~ manipString[1]", manipString[1])
    manipString = manipString.join(' ')
    manipString = manipString.replace(/\-/g, '.')
    // manipString = manipString.join('T')
    // console.log("🚀 ~ file: api.js ~ line 134 ~ getPKIEvents ~ manipString", manipString)
    return manipString
  }

  for (let i in events) {
    let splitString = events[i]
    let splitStringArray = splitString.split(',')
    if (splitStringArray[splitStringArray.length - 1] === '') {
      splitStringArray.pop()
    }
    events[i] = splitStringArray

    if (i === '0') {
      console.log("🚀 ~ file: db.js ~ line 210 ~ populatePKIEvents ~ events[i]", events[i])
      console.log("🚀 ~ file: db.js ~ line 210 ~ populatePKIEvents ~ events[i][0]", events[i][0])
    }
    
    // events[i] = events[i].split(',')
    events[i][0] = convertDateForMoment(events[i][0])

    if (i === '0') {
      console.log("🚀 ~ file: db.js ~ line 210 ~ populatePKIEvents ~ events[i]", events[i])
      console.log("🚀 ~ file: db.js ~ line 210 ~ populatePKIEvents ~ events[i][0]", events[i][0])
    }
  }

  console.log(`events[0]: ${events[0]}`)
  
  try {
    await addToDB('pki_events', columns, events)
  } catch (error) {
    throw error
  }
  

  return true
  
}


const dbResolvers = {
  populateRadar: () => populateRadar(),
  populatePKIEvents: () => populatePKIEvents()
}

module.exports = dbResolvers
