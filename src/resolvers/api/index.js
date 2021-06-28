const getNode       = require('./getNode')
const getNodes      = require('./getNodes')
const getActivity   = require('./getActivity')
const getPKIEvents  = require('./getPKIEvents')

const apiResolvers = {
  getNode: (_, { input: { urbitId: nodeId } }) => getNode(nodeId),
  getNodes: (_, { input: { q = '%', nodeTypes = [], limit = 0, offset = 0 } }) => getNodes(q, nodeTypes, limit, offset),
  getActivity: (_, args) => getActivity(_, args),
  getPKIEvents: (_, args) => getPKIEvents(_, args)
}

module.exports = apiResolvers
