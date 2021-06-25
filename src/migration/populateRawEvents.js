const format = require('pg-format')
const { axiosGet, query } = require('../utils')
const { convertDateToISO } = require('./utils/convertDateToISO')

const populateRawEvents = async () => {
  let events

  try {
    events = await axiosGet('https://azimuth.network/stats/events.txt')
  } catch (error) {
    console.log("🚀 ~ file: populateRawEvents.js ~ line 22 ~ populateRawEvents ~ error", error)
    throw error
  }
  
  events = events.slice(events.indexOf('~')).split('\n')

  const getDataResponse = []

  events.forEach(event => {
    const splitStringArray = event.split(',')

    const splitStringArr = splitStringArray.map(x => {
      if (x === '') {
        return null
      } else {
        return x
      }
    })

    splitStringArr[0] = convertDateToISO(splitStringArr[0])
    getDataResponse.push(splitStringArr)
  })

  let insertQuery = format('INSERT INTO %I (%s, %s, %s, %s, %s, %s) VALUES', 'raw_events', 'DATE', 'POINT', 'EVENT', 'FIELD1', 'FIELD2', 'FIELD3')
  
  getDataResponse.forEach((item, index) => {

    const [date, point, event] = item
    let field1
    let field2
    let field3

    if (item.length > 3 && item[3] !== '') {
      field1 = item[3]
    } else {
      field1 = null
    }
    if (item.length > 4 && item[4] !== '') {
      field2 = item[4]
    } else {
      field2 = null
    }
    if (item.length > 5 && item[5] !== '') {
      field3 = item[5]
    } else {
      field3 = null
    }

    if (index > 0) {
      insertQuery += ','
    }

    insertQuery += format(' (\'%s\', \'%s\', \'%s\', \'%s\', \'%s\', \'%s\')', date, point, event, field1, field2, field3)
  })

  insertQuery += ';'

  try {
    return await query(insertQuery)
  } catch (error) {
    console.log("🚀 ~ file: populateRawEvents.js ~ line 71 ~ populateRawEvents ~ error", error)
    throw error
  }
}

module.exports = { populateRawEvents }
