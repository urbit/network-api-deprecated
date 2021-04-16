const { populateNodeStatus }    = require('./populateNodeStatus')
const { populateEventType }     = require('./populateEventType')
const { populateNodeType }      = require('./populateNodeType')
const { populateRadar }         = require('./populateRadar')
const { populatePing }          = require('./populatePing')
const { populateRawEvents }     = require('./populateRawEvents')
const { populatePKIEvents }     = require('./populatePKIEvents')
const { populateAll }           = require('./populateAll')
const { populateDailyCron }     = require('./populateDailyCron')

const dbResolvers = {
  populateNodeStatus: () => populateNodeStatus(),
  populateEventType:  () => populateEventType(),
  populateNodeType:   () => populateNodeType(),
  populateRadar:      () => populateRadar(),
  populatePing:       () => populatePing(),
  populateRawEvents:  () => populateRawEvents(),
  populatePKIEvents:  () => populatePKIEvents(),
  populateAll:        () => populateAll(),
  populateDailyCron:  () => populateDailyCron()
}

module.exports = dbResolvers