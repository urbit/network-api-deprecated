const https                 = require('https')
const axios                 = require('axios')

const { addToDB }           = require('./utils/addToDB')
const { convertDateToISO }  = require('./utils/convertDateToISO')

const populateRawEvents = async () => {
  console.log('running populateRawEvents')
  const agent = new https.Agent({  
    rejectUnauthorized: false
   })

  let events
  try {
    console.log('in populate pki events try')
    events = await axios.get('https://azimuth.network/stats/events.txt', { httpsAgent: agent })
  } catch (error) {
    throw error
  }

  console.log('after populate pki events try')
  events = events.data

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
  
  try {
    await addToDB('raw_events', returnArr)
  } catch (error) {
    throw error
  }
  
  return true
  
}

module.exports = { populateRawEvents }