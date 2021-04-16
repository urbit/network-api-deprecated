const { addToDB } = require('./utils/addToDB')

const populateEventType = async () => {
  await addToDB('event_type', null)
  return true
}

module.exports = { populateEventType }