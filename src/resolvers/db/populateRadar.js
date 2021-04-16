const https         = require('https')
const axios         = require('axios')

const { addToDB }   = require('./utils/addToDB')

const populateRadar = async () => {
  console.log('running populateRadar')
  const agent = new https.Agent({  
    rejectUnauthorized: false
   })
  let events
  try {
    // The following can be used to test against the radar fixture in case the endpoint is down
    // Will need to copy in the fixture at the appropriate file path, which Chris has but which is not committed due to file size
    // events = JSON.parse(fs.readFileSync('_radar.json', 'utf8'))

    events = await axios.get('http://35.247.74.19:8080/~radar.json', { httpsAgent: agent })
    events = events.data
  } catch (error) {
    throw error
  }
  await addToDB('radar', events)
  return true
}

module.exports = { populateRadar }