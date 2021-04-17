const { axiosGet } = require('../utils')
const { addToDB } = require('./utils/addToDB')
const { convertDateToISO } = require('./utils/convertDateToISO')

const populateRawEvents = async () => {
  let events = await axiosGet('https://azimuth.network/stats/events.txt')
  events = events.slice(events.indexOf('~')).split('\n')

  const returnArr = []

  for (const i in events) {
    const splitString = events[i]
    const splitStringArray = splitString.split(',')

    const newArr = splitStringArray.map(x => {
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
