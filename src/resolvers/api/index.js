const { getNodes } = require('./getNodes')
const { getActivity } = require('./getActivity')
const { getPKIEvents } = require('./getPKIEvents')
const node = require('../field/node')
console.log("🚀 ~ file: index.js ~ line 6 ~ node", node)
const { 
  urbitId,
  numOwners,
  sponsor,
  status,
  kids,
  nodeType,
  continuityNumber,
  revisionNumber,
  ownershipProxy,
  spawnProxy,
  transferProxy,
  managementProxy,
  votingProxy
} = node
console.log("🚀 ~ file: index.js ~ line 7 ~ urbitId", urbitId)

const apiResolvers = {
  getNode: (_, args) => ({
    urbitId: urbitId(_, args),
    numOwners: numOwners(_, args),
    sponsor: sponsor(_, args),
    status: status(_, args),
    kids: kids(_, args),
    nodeType: nodeType(_, args),
    continuityNumber: continuityNumber(_, args),
    revisionNumber: revisionNumber(_, args),
    ownershipProxy: ownershipProxy(_, args),
    spawnProxy: spawnProxy(_, args),
    transferProxy: transferProxy(_, args),
    managementProxy: managementProxy(_, args),
    votingProxy: votingProxy(_, args)
  }),
  getNodes: (_, args) => getNodes(_, args),
  getActivity: (_, args) => getActivity(_, args),
  getPKIEvents: (_, args) => getPKIEvents(_, args)
}

module.exports = apiResolvers
