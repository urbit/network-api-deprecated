const { populateNodeStatus } = require('./populateNodeStatus')
const { populateEventType } = require('./populateEventType')
const { populateNodeType } = require('./populateNodeType')
const { populateRadar } = require('./populateRadar')
const { populatePing } = require('./populatePing')
const { populateRawEvents } = require('./populateRawEvents')
const { populatePKIEvents } = require('./populatePKIEvents')

const populateAll = async () => {
  await populateNodeStatus()
  await populateEventType()
  await populateNodeType()
  await populateRadar()
  await populatePing()
  await populateRawEvents()
  await populatePKIEvents()
}

populateAll()
