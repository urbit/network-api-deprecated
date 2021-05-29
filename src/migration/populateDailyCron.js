const { populateRadar } = require('./populateRadar')
const { populatePing } = require('./populatePing')
const { populateRawEvents } = require('./populateRawEvents')
const { populatePKIEvents } = require('./populatePKIEvents')

const populateDailyCron = async () => {
  await populateRadar()
  await populatePing()
  await populateRawEvents()
  await populatePKIEvents()
}

module.exports = { populateDailyCron }
