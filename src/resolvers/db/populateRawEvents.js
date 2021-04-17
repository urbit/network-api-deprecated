const { axiosGet }          = require('../utils')
const { addToDB }           = require('./utils/addToDB')
const { convertDateToISO }  = require('./utils/convertDateToISO')

const populateRawEvents = async () => {
  
  let events = await axiosGet('https://azimuth.network/stats/events.txt')
  events = events.slice(events.indexOf('~')).split('\n')

  let returnArr = []

  for (let i in events) {
    let splitString = events[i]
    let splitStringArray = splitString.split(',')

    let newArr = splitStringArray.map(x => {
      if (x === '') {
        return null
      } else {
        return x
      }
    })

    newArr[0] = convertDateToISO(newArr[0])
    returnArr.push(newArr)
  }

  await addToDB('raw_events', returnArr)
  
  return true
  
}

module.exports = { populateRawEvents }