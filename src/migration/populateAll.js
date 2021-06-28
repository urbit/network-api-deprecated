const { populateEventType } = require('./populateEventType')
const { populateNodeStatus } = require('./populateNodeStatus')
const { populateRadar } = require('./populateRadar')
const { populatePing } = require('./populatePing')
const { populateRawEvents } = require('./populateRawEvents')
const { populatePKIEvents } = require('./populatePKIEvents')
const { refreshNodeMaterializedView } = require('./refreshNodeMaterializedView')

const populateAll = async () => {
  try {
    await populateEventType()
    await populateNodeStatus()
    await populateRadar()
    await populatePing()
    await populateRawEvents()
    await populatePKIEvents()
    await refreshNodeMaterializedView()
  } catch (error) {
    console.log("🚀 ~ file: populateAll.js ~ line 17 ~ error", error)
    throw error
  }
}

if (process.env.POPULATE) {
  console.log('running populateAll')
  populateAll()
}
